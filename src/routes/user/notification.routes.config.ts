import express, { Router } from "express"
import { CommonRoutesConfig } from "../../common/common.routes.config"
import { auth } from "../../middleware/auth/auth"
import notificationController from "../../controllers/user/notification.controller"

const router: Router = express.Router()

class NotificationRoutes extends CommonRoutesConfig {
  constructor(router: Router) {
    super(router, "NotificationRoutes")
  }

  configureRoutes(): Router {
    // this.router.get("/", [auth], notificationController.getUserNotification)

    // this.router.get(
    //   "/exposure/detail/:id",
    //   [auth],
    //   notificationController.getExposureDetails
    // )
    return this.router
  }
}

export default new NotificationRoutes(router).router
