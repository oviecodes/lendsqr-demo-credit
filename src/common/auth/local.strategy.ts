import { AuthStrategy } from "../../../index"
import db from "../../connectors/knex.connector"
import * as argon2 from "argon2"
import createError from "http-errors"
import { config } from "../config"
import { Knex } from "knex"
import jwt from "jsonwebtoken"
import constants from "../../constants"

class LocalStrategy implements AuthStrategy {
  AUTH_TYPE: string
  constructor() {
    this.AUTH_TYPE = constants.AUTH_TYPES["LOCAL"]
  }
  async register(data: any): Promise<any> {
    try {
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

  async login(data: any) {
    try {
      const { email, password } = data
      const user = await db.table("User").where("email", email).first()
      if (!user) throw new Error()

      const validPassword = argon2.verify(user.password, password)
      if (!validPassword) throw new Error()

      return this.tokens(user)
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
      .where("id", (decoded as jwt.JwtPayload).userId)
      .select("id", "email")
      .first()

    if (!user) throw createError[401]("Unauthorized")

    return user
  }

  async verifyRefreshToken(token: string) {
    const decoded = jwt.verify(
      token,
      config.REFRESH_TOKEN_SECRET
    ) as jwt.JwtPayload

    delete decoded.iat
    delete decoded.exp

    const { userId } = decoded

    const [user] = await db
      .table("User")
      .where("id", userId)
      .select("email", "id")

    if (!user) throw createError[401]("Unauthorized")

    return user
  }

  async logout(userId: string) {
    await Promise.all([db.table("UserToken").where("userId", userId).del()])
  }
}

export default LocalStrategy
