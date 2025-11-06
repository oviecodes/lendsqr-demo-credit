import db from "../../connectors/knex.connector"
import * as argon2 from "argon2"
import randomstring from "randomstring"
import createError from "http-errors"
import AuthConfig from "../../lib/authentication.lib"
import { config } from "../../common/config"
import constants from "../../constants"

class AuthService {
  async register(data: any) {
    return new AuthConfig("local").register(data)
  }

  async login(data: { email: string; password: string; type: "local" }) {
    return new AuthConfig("local").login(data)
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
}

export default new AuthService()
