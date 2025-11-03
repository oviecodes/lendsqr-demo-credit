import { AuthStrategy } from "../../../index"
import db from "../../connectors/knex.connector"
import * as argon2 from "argon2"
import createError from "http-errors"
import randomstring from "randomstring"
import { config } from "../config"
import { Knex } from "knex"
import jwt from "jsonwebtoken"
import { build } from "joi"
import AuthConfig from "../../lib/authentication.lib"
import constants from "../../constants"
import users from "../../services/user"

class LocalStrategy implements AuthStrategy {
  AUTH_TYPE: string
  constructor() {
    this.AUTH_TYPE = constants.AUTH_TYPES["LOCAL"]
  }
  async register(data: any): Promise<any> {
    try {
      // in middleware check adjutor service.
      return db.transaction(async (trx: Knex.Transaction) => {
        data.password = await argon2.hash(data.password)
        await trx.table("User").insert(data, ["id"])
        const user = await trx.table("User").where("email", data.email).first()
        await trx.table("Wallet").insert({
          userId: user.id,
        })
        return this.tokens(user)
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

  async tokens(data: any) {
    const { id: userId } = data

    const accessToken = jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET, {
      expiresIn: "24h",
      issuer: config.AUTH_ISSUER_BASE_URL,
    })

    const refreshToken = jwt.sign({ userId }, config.REFRESH_TOKEN_SECRET, {
      issuer: config.AUTH_ISSUER_BASE_URL,
      expiresIn: "7d",
    })

    return { accessToken, refreshToken }
  }

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
    // const tokens = await getToken(user.id, this.AUTH_TYPE)

    // if (!tokens || tokens.accessToken !== token)
    //   throw createError[401]("Unauthorized")

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

    // const [dbTokens, tokens] = await Promise.all([
    //   db
    //     .table("UserToken")
    //     .where("userId", user.id)
    //     .select("refreshToken")
    //     .orderBy("createdAt", "desc"),
    //   // getToken(user.id, this.AUTH_TYPE),
    // ])

    // if (!dbTokens.length || !tokens) throw new createError[401]("Unauthorized")

    // if decoded is valid but not the latest token, then execute the code below
    // const isValid =
    //   (await argon2.verify(dbTokens[0].refreshToken, token)) &&
    //   (await argon2.verify(dbTokens[0].refreshToken, tokens.refreshToken))

    // if (token !== tokens.refreshToken || !isValid) {
    //   //delete all refresh tokens associated withn user - force relogin
    //   await this.logout(user.id)
    //   throw new createError[401]("Unauthorized")
    // }

    // return { isValid, resourceId: resihubUserId, id: user.id }
  }

  async logout(userId: string) {
    await Promise.all([
      // removeToken(userId, this.AUTH_TYPE),
      db.table("UserToken").where("userId", userId).del(),
    ])
  }
}

export default LocalStrategy
