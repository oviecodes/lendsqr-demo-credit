import db from "../../connectors/knex.connector"
import * as argon2 from "argon2"
import randomstring from "randomstring"
import createError from "http-errors"
import AuthConfig from "../../lib/authentication.lib"
import { config } from "../../common/config"
import constants from "../../constants"

class AuthService {
  async register(data: any) {
    const { type } = data
    delete data.type
    const otp = await new AuthConfig(type).register(data)
    return { email: data.email, ...otp }
  }

  async login(data: {
    email: string
    password: string
    type: "local"
    newDevice: boolean
  }) {
    const info = await new AuthConfig(data.type).login(data)
    return { email: data.email, ...info }
  }

  async generateOTP(email: string): Promise<void> {
    const user = await db
      .table("User")
      .where("email", email)
      .select("id")
      .first()

    if (!user) return

    // const { code, name }: any = await new AuthConfig(
    //   constants.AUTH_TYPES.LOCAL
    // ).generateOTP(user.id, true)
  }

  async verifyOTP(data: { email: string; token: string }) {
    const { email, token } = data

    const [{ id, verified, resihubUserId }] = await db
      .table("User")
      .where("email", email)
      .select("id", "verified", "resihubUserId")

    // const isValid = await AuthConfig.validateOTP({
    //   resourceId: id,
    //   type: "local",
    //   token,
    // })

    // if (!isValid) {
    //   throw createError[401]("Invalid token")
    // }

    await db
      .table("UserVerificationCode")
      .where("userId", id)
      .update({ code: "" })

    // if user is not verified, set verification to true
    if (!verified)
      await db.table("User").where("id", id).update({ verified: true })

    return await new AuthConfig("local").tokens({
      id,
      resourceId: resihubUserId,
    })
  }

  async checkPassKey(data: any) {
    // return AuthConfig.verifyPasskey(data)
  }

  async refreshToken(token: string) {
    return new AuthConfig("local").refreshToken(token)
  }

  async checkEmail(email: string) {
    const user = await db
      .table("User")
      .whereRaw(`pgp_sym_decrypt("email"::bytea, ?) = ?`, [
        config.ENCRYPTION_KEY,
        email,
      ])
    return { registered: !!user.length }
  }

  async createLoginActivity(
    userId: number | string,
    data: Record<string, any>
  ) {
    await db.table("UserLoginActivity").insert({
      userId,
      userAgent: db.raw(`pgp_sym_encrypt(?, ?)`, [
        data["user-agent"],
        config.ENCRYPTION_KEY,
      ]),
      ipAddress: db.raw(`pgp_sym_encrypt(?, ?)`, [
        data["x-forwarded-for"],
        config.ENCRYPTION_KEY,
      ]),
    })
  }
}

export default new AuthService()
