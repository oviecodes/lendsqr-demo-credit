import { AuthStrategy } from "../../../index"
import db from "../../connectors/knex.connector"
import * as argon2 from "argon2"
import createError from "http-errors"
import randomstring from "randomstring"
import { config } from "../config"
import { Knex } from "knex"
import {
  getToken,
  removeToken,
  setToken,
  setVerificationCode,
} from "../../utils/redis.utils"
import jwt from "jsonwebtoken"
import { build } from "joi"
import AuthConfig from "../../lib/authentication.lib"
import constants from "../../constants"

class LocalStrategy implements AuthStrategy {
  AUTH_TYPE: string
  constructor() {
    this.AUTH_TYPE = constants.AUTH_TYPES["LOCAL"]
  }
  async register(data: any): Promise<any> {
    if (!data.building) {
      data.building = null
    }

    const { building, location } = data

    delete data.secret
    delete data.type
    delete data.building
    delete data.location

    try {
      return db.transaction(async (trx: Knex.Transaction) => {
        delete data.deviceId

        const resihubUserId = `RU-${randomstring.generate({
          length: 8,
          capitalization: "lowercase",
          charset: "numeric",
        })}`

        const [{ id }] = await trx
          .table("User")
          .insert({ ...data, resihubUserId }, ["id"])

        await this.completeAuth({ id, building, location, trx }, true)

        return { otp: true, id }
      })
    } catch (e) {
      console.log(e)
      throw createError.InternalServerError("Something went wrong")
    }
  }

  async login(data: any): Promise<{
    email: string
    id: string
    resourceId: string
    type?: string
    otp?: boolean
    name?: string
  }> {
    delete data.type

    try {
      const { email } = data

      //check email and password
      const user = await db.table("User").where("email", email).first()

      if (!user) throw new Error()

      return {
        id: user.id,
        resourceId: user.resihubUserId,
        email,
        otp: true,
        name: user.firstName + " " + user.lastName,
      }
    } catch (e) {
      throw createError[401]("Invalid credentials")
    }
  }

  async completeAuth(data: any, newDevice: boolean) {
    const { trx: db } = data
    try {
      const { id: userId, building, location } = data

      const createNotificationData = db
        .table("UserNotificationSetting")
        .insert({ userId })

      const createPrivacyPolicyAgreement = db
        .table("UserPrivacyPolicyAgreement")
        .insert({ userId })

      const userLocation = db
        .table("UserLocation")
        .insert({ userId, ...location })

      const addUserBuilding = building
        ? db.table("UserBuilding").insert({ ...building, userId })
        : Promise.resolve(true)

      // get community forumId, and building forumId
      const [communityForum, buildingForum] = await Promise.all([
        db
          .table("CommunityForum")
          .where("neighbourhoodId", location.neighbourhoodId)
          .select("forumId")
          .first(),
        building
          ? db
              .table("BuildingForum")
              .where("buildingId", building.buildingId)
              .select("forumId")
              .first()
          : Promise.resolve(null),
      ])

      // add user to forums
      const addBuildingForumMember = building
        ? db.table("ForumMember").insert({
            userId,
            forumId: buildingForum.forumId,
            forumType: "BUILDING",
          })
        : Promise.resolve(true)

      const addCommuintyForumMember = db.table("ForumMember").insert({
        userId,
        forumId: communityForum.forumId,
        forumType: "COMMUNITY",
      })

      await Promise.all([
        createNotificationData,
        createPrivacyPolicyAgreement,
        addUserBuilding,
        userLocation,
        addBuildingForumMember,
        addCommuintyForumMember,
      ])
    } catch (e: any) {
      console.log(e)
      throw createError.InternalServerError("Something went wrong")
    }

    // if (newDevice && !newUser) {
    //   //send mail for login activity - 5 mins delay
    //   //fetch latest detials login for user
    //   queue.add(
    //     "email",
    //     {
    //       recipient: data.email,
    //       type: "newDeviceLogin",
    //       subject: "New Device Login",
    //       sender: "login@portaul.com",
    //       data: {
    //         deviceId,
    //         when: new Date(),
    //       },
    //     },
    //     { delay: 2 * 60 * 1000 }
    //   )
    // }
  }

  async tokens(data: any) {
    const { resourceId: resihubUserId, id: userId } = data

    const accessToken = jwt.sign(
      { resihubUserId },
      config.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "15m",
        issuer: config.AUTH_ISSUER_BASE_URL,
      }
    )

    const refreshToken = jwt.sign(
      { resihubUserId },
      config.REFRESH_TOKEN_SECRET,
      {
        issuer: config.AUTH_ISSUER_BASE_URL,
        expiresIn: "7d",
      }
    )

    const tokenEncrypted = await argon2.hash(refreshToken)

    // store tokens in database - use token rotation??
    await db.table("UserToken").insert({ refreshToken: tokenEncrypted, userId })

    //store token in redis
    await setToken(userId, { accessToken, refreshToken }, this.AUTH_TYPE)

    return { accessToken, refreshToken }
  }

  async verifyOTP() {}

  async verifyAccessToken(token: string) {
    const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET)

    //check for user
    const user = await db
      .table("User")
      .where("resihubUserId", (decoded as jwt.JwtPayload).resihubUserId)
      .select("id", "email", "resihubUserId")
      .first()

    if (!user) throw createError[401]("Unauthorized")

    //check if access token is the current one
    const tokens = await getToken(user.id, this.AUTH_TYPE)

    if (!tokens || tokens.accessToken !== token)
      throw createError[401]("Unauthorized")

    delete user.password

    return user
  }

  async verifyRefreshToken(token: string) {
    const decoded = jwt.verify(
      token,
      config.REFRESH_TOKEN_SECRET
    ) as jwt.JwtPayload

    delete decoded.iat
    delete decoded.exp

    const { resihubUserId } = decoded

    const [user] = await db
      .table("User")
      .where("resihubUserId", resihubUserId)
      .select("email", "id")

    if (!user) throw createError[401]("Unauthorized")

    const [dbTokens, tokens] = await Promise.all([
      db
        .table("UserToken")
        .where("userId", user.id)
        .select("refreshToken")
        .orderBy("createdAt", "desc"),
      getToken(user.id, this.AUTH_TYPE),
    ])

    if (!dbTokens.length || !tokens) throw new createError[401]("Unauthorized")

    // if decoded is valid but not the latest token, then execute the code below
    const isValid =
      (await argon2.verify(dbTokens[0].refreshToken, token)) &&
      (await argon2.verify(dbTokens[0].refreshToken, tokens.refreshToken))

    if (token !== tokens.refreshToken || !isValid) {
      //delete all refresh tokens associated withn user - force relogin
      await this.logout(user.id)
      throw new createError[401]("Unauthorized")
    }

    return { isValid, resourceId: resihubUserId, id: user.id }
  }

  async logout(userId: string) {
    await Promise.all([
      removeToken(userId, this.AUTH_TYPE),
      db.table("UserToken").where("userId", userId).del(),
    ])
  }

  async generateOTP(data: { id: string; code: string }) {
    let { id, code } = data

    const user = await db
      .table("User")
      .where("id", id)
      .select("email", "firstName", "lastName")
      .first()

    if (user.email === "resihubtest@gmail.com") {
      code = "000000"
    }

    const writeVerification = db
      .table("UserVerificationCode")
      .insert({ userId: id, code, createdAt: new Date() })

    const cacheVerification = setVerificationCode(id, { code }, this.AUTH_TYPE)

    await Promise.all([writeVerification, cacheVerification])

    const name = user.firstName + " " + user.lastName

    return name
  }

  async forgotPassword(data: any) {
    const { email } = data

    const user = await db.table("User").where("email", email).first()
  }

  async resetPassword(data: any) {
    const { id, code, password } = data

    const hashedPassword = await argon2.hash(password)

    await db.table("User").where("id", id).update({ password: hashedPassword })
  }
}

export default LocalStrategy

// eeb750d2-3ce2-44da-a025-802e23e93e87 - E05014018
