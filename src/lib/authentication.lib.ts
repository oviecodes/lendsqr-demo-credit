import { Auth, AuthStrategy } from "../../index"
import strategies from "../common/auth"
import randomstring from "randomstring"
import db from "../connectors/knex.connector"
import { config } from "../common/config"
import createError from "http-errors"

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
  }

  constructor(strategy: string) {
    this.strategy = this.strategies[strategy]
    this.strategyType = strategy
  }

  async register(data: { email: string; password?: string }): Promise<any> {
    await this.strategy.register({
      ...data,
    })
  }

  async login(data: { email: string; password?: string; newDevice?: boolean }) {
    const resource: any = await this.strategy.login({ ...data })

    let { otp, name } = resource
    delete resource.otp

    if (!otp) return this.tokens(resource)

    return { otp: process.env.NODE_ENV !== "production" ? otp : null }
  }

  async logout(resourceId: number | string) {
    return this.strategy.logout(resourceId)
  }

  async tokens(data: { resourceId: string; id: string }) {
    return this.strategy.tokens(data)
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
}

export default AuthConfig
