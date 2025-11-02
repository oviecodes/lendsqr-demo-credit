import express, { Router } from "express"
import { CommonRoutesConfig } from "../../../common/common.routes.config"
import { auth } from "../../../middleware/auth/auth"
import userController from "../../../controllers/user"
import { validate } from "../../../middleware/validator"
import forumValidator from "../../../validators/user/forum.validator"
import { forumCheck } from "../../../middleware/check"
import buildingValidator from "../../../validators/user/building.validator"

const router: Router = express.Router()

class UserBuildingUpdateRoutes extends CommonRoutesConfig {
  constructor(router: Router) {
    super(router, "UserBuildingUpdateRoutes")
  }

  configureRoutes(): Router {
    // building updates

    return this.router
  }
}

export default new UserBuildingUpdateRoutes(router).router
