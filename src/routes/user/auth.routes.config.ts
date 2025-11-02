import express, { Router } from "express"
import { CommonRoutesConfig } from "../../common/common.routes.config"
import user from "../../controllers/user"
import { validate } from "../../middleware/validator"
import schema from "../../validators/user/auth.validator"
import { authCheck } from "../../middleware/check"

const router: Router = express.Router()

class AuthRoutes extends CommonRoutesConfig {
  constructor(router: Router) {
    super(router, "AuthRoutes")
  }

  configureRoutes(): Router {
    this.router.get("/", (req, res) => {
      res.status(200).json({ status: true, message: "Auth Reached" })
    })

    this.router.post(
      "/register",
      [
        validate(schema.register),
        authCheck.checkAdminWardCode,
        authCheck.checkEmailExists,
      ],
      user.authController.register
    )

    this.router.post(
      "/verify",
      [validate(schema.verify)],
      user.authController.validateOTP
    )

    this.router.post(
      "/login",
      [validate(schema.login)],
      user.authController.login
    )

    this.router.post(
      "/verify-passkey",
      [validate(schema.passkey), authCheck.checkUserFomEmail],
      user.authController.checkPassKey
    )

    this.router.post(
      "/refresh",
      [validate(schema.refresh)],
      user.authController.refreshToken
    )

    this.router.post(
      "/check-email",
      [validate(schema.checkEmail)],
      user.authController.checkEmail
    )

    this.router.post(
      "/get-otp",
      [validate(schema.checkEmail)],
      user.authController.getOTP
    )

    return this.router
  }
}

export default new AuthRoutes(router).router
