import { CommonRoutesConfig } from "../../common/common.routes.config"
import express, { Router } from "express"
import user from "../../controllers/user"
import { auth } from "../../middleware/auth/auth"
import { validate } from "../../middleware/validator"
import userSchema from "../../validators/user/user.validator"
import { userCheck } from "../../middleware/check"

const router: Router = express.Router()

class UsersRoutes extends CommonRoutesConfig {
  constructor(router: Router) {
    super(router, "UsersRoutes")
  }

  configureRoutes(): Router {
    this.router.get("/me", [auth], user.userController.me)

    this.router.patch(
      "/me",
      [
        auth,
        validate(userSchema.update),
        validate(userSchema.updateImage, "files"),
        userCheck.checkPreviousProfileImage,
        userCheck.checkUserLocationAndBuildingUpdate,
      ],
      user.userController.update
    )
    // this.router.patch(
    //   "/update-profile-picture",
    //   [
    //     auth,
    //     validate(userSchema.updateImage, "files"),
    //     checkPreviousProfileImage,
    //   ],
    //   UserController.uploadProfilePicture
    // )

    // this.router.get("/test-data", [auth], UserController.testData)

    // // update email
    // this.router.patch(
    //   "/email",
    //   [auth, validate(userSchema.updateEmail)],
    //   UserController.update
    // )
    // // change password
    // this.router.patch(
    //   "/reset-password",
    //   [auth, validate(userSchema.updatePassword)],
    //   UserController.updatePassword
    // )
    // // Manage access and device
    // this.router.get("/access", [auth], UserController.devices)

    // // Push notifications management
    // this.router.patch(
    //   "/notification-settings",
    //   [auth, validate(userSchema.updateNotification)],
    //   UserController.updateNotificationPreferences
    // )

    // this.router.get(
    //   "/notification-settings",
    //   [auth],
    //   UserController.getNotificationPreferences
    // )

    // this.router.get(
    //   "/health-report",
    //   [auth, validate(userSchema.healthReport, "query")],
    //   UserController.healthReport
    // )

    // this.router.get("/export-data", [auth], UserController.exportData)
    // this.router.delete("/delete-account", [auth], UserController.deleteAccount)

    // this.router.get("/status", [auth], UserController.myStatus)

    // // this.router.get("/interests", [auth], UserController.allInterests)
    // this.router.get("/interest", [auth], UserController.getUserInterests)

    // this.router.post(
    //   "/interest",
    //   [auth, validate(userSchema.updateUserInterest)],
    //   UserController.addUserInterest
    // )

    return this.router
  }
}

export default new UsersRoutes(router).router
