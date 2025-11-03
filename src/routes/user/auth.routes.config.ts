import express, { Router } from "express"
import { CommonRoutesConfig } from "../../common/common.routes.config"
import { authController } from "../../controllers"
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
      [validate(schema.register), authCheck.checkEmailExists],
      authController.register
    )

    this.router.post(
      "/verify",
      [validate(schema.verify)],
      authController.validateOTP
    )

    this.router.post("/login", [validate(schema.login)], authController.login)

    this.router.post(
      "/verify-passkey",
      [validate(schema.passkey), authCheck.checkUserFomEmail],
      authController.checkPassKey
    )

    this.router.post(
      "/refresh",
      [validate(schema.refresh)],
      authController.refreshToken
    )

    this.router.post(
      "/check-email",
      [validate(schema.checkEmail)],
      authController.checkEmail
    )

    this.router.post(
      "/get-otp",
      [validate(schema.checkEmail)],
      authController.getOTP
    )

    return this.router
  }
}

export default new AuthRoutes(router).router
