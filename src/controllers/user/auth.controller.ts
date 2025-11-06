import { Request, Response, NextFunction } from "express"
import users from "../../services/user/"
import createError from "http-errors"

class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await users.authService.register(req.body)

      return res.status(200).json({
        success: true,
        message: "User registered successfully",
        data,
      })
    } catch (e: any) {
      return next(createError(e))
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await users.authService.login(req.body)

      return res.status(200).json({
        success: true,
        message: "User login successful",
        data,
      })
    } catch (e: any) {
      return next(createError(e))
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await users.authService.refreshToken(req.body.token)
      return res.status(200).json({
        success: true,
        message: "Token refreshed successfully",
        data,
      })
    } catch (e: any) {
      //   console.log(e)
      return next(createError(e))
    }
  }

  async checkEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await users.authService.checkEmail(req.body.email)
      return res.status(200).json({
        success: true,
        message: "Email Check",
        data,
      })
    } catch (e: any) {
      //   console.log(e)
      return next(createError(e))
    }
  }
}

export default new AuthController()
