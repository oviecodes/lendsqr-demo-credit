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
        data: process.env.NODE_ENV === "production" ? null : data, //change later
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

  async checkPassKey(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await users.authService.checkPassKey(req.body)

      return res.status(200).json({
        success: true,
        message: "Verification successful",
        data,
      })
    } catch (e: any) {
      return next(createError(e))
    }
  }

  async validateOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await users.authService.verifyOTP(req.body)
      return res.status(200).json({
        success: true,
        message: "OTP validated successfully",
        data,
      })
    } catch (e: any) {
      //   console.log(e)
      return next(createError(e))
    }
  }

  async getOTP(req: Request, res: Response, next: NextFunction) {
    try {
      await users.authService.generateOTP(req.body.email)
      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
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
