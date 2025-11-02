import { AuthStrategy } from "../common"

class AdminStrategy implements AuthStrategy {
  async register(data: any) {}

  async login(data: any) {
    return {} as any
  }

  async completeAuth() {}

  async tokens() {
    return {} as any
  }

  // async verifyTokens() {}

  async verifyAccessToken() {}

  async verifyRefreshToken() {}

  async logout() {}

  async generateOTP() {}

  async forgotPassword() {}

  async resetPassword() {}
}

export default AdminStrategy
