import createHttpError from "http-errors"
import { AuthStrategy } from "../common"
import argon2 from "argon2"
import db from "../../connectors/knex.connector"
import {
  getToken,
  setToken,
  setVerificationCode,
} from "../../utils/redis.utils"
import { config } from "../config"
import jwt from "jsonwebtoken"

import randomstring from "randomstring"
import { AUTH_TYPES } from "../../constants/auth.constants"
import createError from "http-errors"
import sendEmail from "../../utils/nodemailer.utils"

class BusinessStrategy implements AuthStrategy {
  AUTH_TYPE: string

  constructor() {
    this.AUTH_TYPE = AUTH_TYPES.BUSINESS
  }

  async register(data: any) {
    try {
      return db.transaction(async (trx) => {
        const { location } = data
        delete data.location

        const password = await argon2.hash(data.password)

        data.resihubBusinessId = `RB-${randomstring.generate({
          length: 8,
          charset: "numeric",
          capitalization: "lowercase",
        })}`

        const [{ id, resihubBusinessId }] = await trx
          .table("Business")
          .insert({ ...data, password }, ["id", "resihubBusinessId"])

        // return { resourceId: business[0].id, location, otp: false }
        await this.completeAuth({ id, location, trx }, true)

        return {
          otp: true,
          resourceId: resihubBusinessId,
          id,
        }
      })
    } catch (e: any) {
      throw createHttpError(e)
    }
  }

  async login(data: any) {
    try {
      const { email, password } = data
      const business = await db
        .table("Business")
        .where("email", email)
        .select("password", "id", "resihubBusinessId")
        .first()

      if (!business) throw new Error()

      const isVaid = await argon2.verify(business.password, password)

      if (!isVaid) throw new Error()
      delete business.password

      return { id: business.id, resourceId: business.resihubBusinessId, email }
    } catch (e: any) {
      throw new Error("Invalid credentials")
    }
  }

  async completeAuth(data: any, newDevice: boolean) {
    const { id, location, trx: db } = data

    const addBusinesslocation = db.table("BusinessLocation").insert({
      businessId: id,
      ...location,
    })

    const createPrivacyPolicyAgreement = db
      .table("BusinessPrivacyPolicyAgreement")
      .insert({
        businessId: id,
      })

    await Promise.all([addBusinesslocation, createPrivacyPolicyAgreement])
  }

  async tokens(data: any) {
    const { resourceId: resihubBusinessId, id } = data

    const accessToken = jwt.sign(
      { resihubBusinessId },
      config.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
        issuer: config.AUTH_ISSUER_BASE_URL,
      }
    )

    const refreshToken = jwt.sign(
      { resihubBusinessId },
      config.REFRESH_TOKEN_SECRET,
      {
        issuer: config.AUTH_ISSUER_BASE_URL,
        expiresIn: "7d",
      }
    )

    const tokenEncrypted = await argon2.hash(refreshToken)

    // store tokens in database - use token rotation??
    await db
      .table("BusinessToken")
      .insert({ refreshToken: tokenEncrypted, businessId: id })

    //store token in redis
    await setToken(id, { accessToken, refreshToken }, this.AUTH_TYPE)

    return { accessToken, refreshToken }
  }

  // async verifyTokens() {}

  async verifyAccessToken(token: string) {
    const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET)

    //check for user
    const business = await db
      .table("Business")
      .where("resihubBusinessId", (decoded as jwt.JwtPayload).resihubBusinessId)
      .select("id", "email", "resihubBusinessId")
      .first()

    if (!business) throw createError[401]("Unauthorized")

    //check if access token is the current one
    const tokens = await getToken(business.id, this.AUTH_TYPE)

    if (!tokens || tokens.accessToken !== token)
      throw createError[401]("Unauthorized")

    delete business.password

    return business
  }

  async verifyRefreshToken(token: string) {
    const decoded = jwt.verify(
      token,
      config.REFRESH_TOKEN_SECRET
    ) as jwt.JwtPayload

    delete decoded.iat
    delete decoded.exp

    const { resihubBusinessId } = decoded

    const business = await db
      .table("Business")
      .where("resihubBusinessId", resihubBusinessId)
      .select("email", "id")
      .first()

    if (!business) throw createError[401]("Unauthorized")

    const [dbTokens, tokens] = await Promise.all([
      db
        .table("BusinessToken")
        .where("businessId", business.id)
        .select("refreshToken")
        .orderBy("createdAt", "desc"),
      getToken(business.id, this.AUTH_TYPE),
    ])

    if (!dbTokens.length || !tokens) throw new createError[401]("Unauthorized")

    // if decoded is valid but not the latest token, then execute the code below
    const isValid =
      (await argon2.verify(dbTokens[0].refreshToken, token)) &&
      (await argon2.verify(dbTokens[0].refreshToken, tokens.refreshToken))

    if (token !== tokens.refreshToken || !isValid) {
      //delete all refresh tokens associated withn user - force relogin
      await this.logout(business.id)
      throw new createError[401]("Unauthorized")
    }

    return { isValid, resourceId: resihubBusinessId, id: business.id }
  }

  async logout(businessId: string | number) {}

  async generateOTP(data: any) {
    const { id, code } = data

    const writeVerification = db
      .table("BusinessVerificationCode")
      .insert({ businessId: id, code, createdAt: new Date() })

    const cacheVerification = setVerificationCode(id, { code }, this.AUTH_TYPE)

    await Promise.all([writeVerification, cacheVerification])
  }

  // Password reset
  async resetPassword(data: any) {
    const { email, token, password } = data

    const business = await db
      .table("Business")
      .where("email", email)
      .select("id")
      .first()

    if (!business) return

    const tokenData = await db
      .table("BusinessPasswordReset")
      .where("businessId", business.id)
      .where("token", token)
      .where("expiresAt", ">", new Date())
      .first()

    if (!tokenData || tokenData.token !== token) {
      throw createHttpError[401]("Invalid token")
    }

    const hashedPassword = await argon2.hash(password)

    await Promise.all([
      db
        .table("Business")
        .where("id", business.id)
        .update({ password: hashedPassword }),
      db
        .table("BusinessPasswordReset")
        .where("businessId", business.id)
        .where("token", token)
        .update({
          token: "",
          expiresAt: null,
        }),
    ])
  }

  async forgotPassword(data: any) {
    const { email } = data
    // check business exists
    // create token - 9 digits, store in db or redis
    // send email with link and token

    const business = await db
      .table("Business")
      .where("email", email)
      .select("id")
      .first()

    if (!business) return

    const token = randomstring.generate({
      length: 9,
      charset: "alphanumeric",
    })

    const existingToken = await db
      .table("BusinessPasswordReset")
      .where("businessId", business.id)
      .first()

    if (!existingToken) {
      await db.table("BusinessPasswordReset").insert({
        businessId: business.id,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      })
    } else {
      await db
        .table("BusinessPasswordReset")
        .where("businessId", business.id)
        .update({ token, expiresAt: new Date(Date.now() + 1000 * 60 * 60) })
    }

    // send email with link and token
    const link = `${config.BUSINESS_FRONTEND_URL}/reset-password?token=${token}`

    const emailData = {
      token,
      link,
    }

    sendEmail
      .setSubject("Reset Password")
      .setReceiver(email)
      .setSenderEmail(config.MAIL_SENDER_EMAIL)
      .setEmailSenderName(config.MAIL_SENDER_NAME)
      .sendHtml("business-reset-password", emailData)
  }
}

export default BusinessStrategy
