import express, { Router } from "express"
import { CommonRoutesConfig } from "../../common/common.routes.config"
import { auth } from "../../middleware/auth/auth"
import { reportContentCheck } from "../../middleware/check"
import user from "../../controllers/user"
import { validate } from "../../middleware/validator"
import { reportContent } from "../../validators/user/report-content.validator"

const { UserContentReportController } = user

const router: Router = express.Router()

class UserContentReportRoutes extends CommonRoutesConfig {
  constructor(router: Router) {
    super(router, "ContentReportRoutes")
  }

  configureRoutes(): Router {
    this.router.get("/reasons", [auth], UserContentReportController.getReasons)

    this.router.post(
      "/",
      [auth, validate(reportContent), reportContentCheck.checkContent],
      UserContentReportController.reportContent
    )
    return this.router
  }
}

export default new UserContentReportRoutes(router).router
