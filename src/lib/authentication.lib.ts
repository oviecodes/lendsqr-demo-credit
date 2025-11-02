import { Auth, AuthStrategy } from "../../index"
import strategies from "../common/auth"
import randomstring from "randomstring"
import db from "../connectors/knex.connector"
import { config } from "../common/config"
import createError from "http-errors"

import {
  getVerificationCode,
  removeVerificationCode,
  setVerificationCode,
} from "../utils/redis.utils"
import emailSender from "../utils/nodemailer.utils"
import queue from "../utils/queue"

/**
 * @param AuthConfig
 * usage
 * const auth = new AuthConfig(stratrgy)
 * auth.getToken() -- gets accessToken and refreshToken
 * auth.checkToken() -- checks tokens
 * auth.register() -- carries out registration for specific stratrgy
 * auth.login() -- does login for specific strategy
 */

class AuthConfig implements Auth {
  strategyType: string
  strategy: AuthStrategy

  strategies: any = {
    local: strategies.local,
    admin: strategies.admin,
    business: strategies.business,
  }

  constructor(strategy: string) {
    this.strategy = this.strategies[strategy]
    this.strategyType = strategy
  }

  async register(data: { email: string; password?: string }): Promise<any> {
    // checkPostCode
    // await this.checkPostCodeData()

    const registrationDetails = await this.strategy.register({
      ...data,
    })

    let { otp } = registrationDetails

    delete registrationDetails.otp

    if (!otp) return this.tokens(registrationDetails)

    console.log(this.strategyType)

    otp = otp ? await this.generateOTP(registrationDetails.id) : null

    //update message with templates
    const template =
      this.strategyType === "business"
        ? "business-registration"
        : "user-registration"

    const senderName =
      this.strategyType === "business" ? "Resihub Business" : "Resihub App"

    const name = (data as any)?.firstName + " " + (data as any)?.lastName

    emailSender
      .setReceiver(data.email)
      .setEmailSenderName(senderName)
      .setSubject("Verify it’s You! Welcome to Resihub.")
      .sendHtml(template, { otp, name })

    return { otp: process.env.NODE_ENV !== "production" ? otp : null }
  }

  async login(data: { email: string; password?: string; newDevice?: boolean }) {
    const resource: any = await this.strategy.login({ ...data })

    let { otp, name } = resource
    delete resource.otp

    if (!otp) return this.tokens(resource)

    otp = otp ? await this.generateOTP(resource.id) : null

    // send email depending on the strategy
    AuthConfig.sendEmail(this.strategyType as any, resource.email, otp, name)

    return { otp: process.env.NODE_ENV !== "production" ? otp : null }
  }

  async logout(resourceId: number | string) {
    return this.strategy.logout(resourceId)
  }

  async verifyPasskey(data: any) {
    // check user passkey
    const userDet = await db
      .table("UserMetadata")
      .where("userId", data.userId)
      .select(
        "id",
        db.raw(`pgp_sym_decrypt("passKey"::bytea, ?) as passKey`, [
          config.ENCRYPTION_KEY,
        ])
      )

    // if it matches, then we update Authconfig.completeAuth
    if (!userDet.length) throw createError[404]("Resource not found")

    if (userDet[0].passkey !== data.passKey)
      throw createError[404]("Resource not found")

    this.completeAuth(data, true)
    // return AuthConfig.tokens({
    //   portaulUserId: data.portaulUserId,
    //   id: data.userId,
    // })
  }

  async tokens(data: { resourceId: string; id: string }) {
    return this.strategy.tokens(data)
  }

  async generateOTP(id: any, addName: boolean = false) {
    const code = randomstring.generate({
      length: 6,
      charset: "numeric",
    })

    const name = await this.strategy.generateOTP({ id, code })
    // send email

    if (addName) return { code, name }
    return code
  }

  static async validateOTP(data: {
    resourceId: string | number
    token: string
    type: string
  }): Promise<any> {
    console.log("type", data.type)
    const { resourceId, token, type } = data
    const verify = await getVerificationCode(resourceId, type)

    console.log(verify, token)

    const verified = verify?.code === token

    if (verified) await removeVerificationCode(resourceId, type)

    if (type === "business") {
      // get business
      const tokenData = await db
        .table("Business")
        .where("id", resourceId)
        .select("id", "resihubBusinessId as resourceId")
        .first()
      const tokens = await new AuthConfig(type).tokens(tokenData)
      return { isValid: verified, authTokens: tokens }
    }

    return verified
  }

  async completeAuth(data: any, newDevice: boolean) {
    // this.strategy.completeAuth(data)
    const { db } = data
    delete data.db
    await this.strategy.completeAuth(data, newDevice)
  }

  async verifyAccessToken(token: string) {
    return this.strategy.verifyAccessToken(token)
  }

  async verifyRefreshToken(token: string) {
    return this.strategy.verifyRefreshToken(token)
  }

  async refreshToken(token: string) {
    const { isValid, resourceId, id } = await this.verifyRefreshToken(token)
    if (!isValid) throw createError[401]("Unauthorized")

    return this.tokens({ resourceId, id })
  }

  async forgotPassword(data: any) {
    return this.strategy.forgotPassword(data)
  }

  async resetPassword(data: any) {
    return this.strategy.resetPassword(data)
  }

  static async sendEmail(
    strategy: string,
    email: string,
    otp: string,
    name: string
  ) {
    switch (strategy) {
      case "local":
        await emailSender
          .setReceiver(email)
          .setSubject("Verify it’s You! Welcome to Resihub.")
          .setEmailSenderName("Resihub App")
          .sendHtml("user-registration", { otp, name })
        break
      case "admin":
        // await emailSender
        //   .setReceiver(email)
        //   .setSubject("Verify it’s You! Welcome to Resihub.")
        //   .setEmailSenderName("Resihub App")
        //   .sendHtml("user-registration", { otp })
        break
      case "business":
        // await emailSender
        //   .setReceiver(email)
        //   .setSubject("Verify it’s You! Welcome to Resihub.")
        //   .setEmailSenderName("Resihub App")
        //   .sendHtml("user-registration", { otp })
        break
      default:
        break
    }
  }

  async checkPostCodeData() {}
}

export default AuthConfig
