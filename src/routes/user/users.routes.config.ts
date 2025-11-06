import { CommonRoutesConfig } from "../../common/common.routes.config"
import express, { Router } from "express"
import { usersController } from "../../controllers"
import { auth } from "../../middleware/auth/auth"

const router: Router = express.Router()

class UsersRoutes extends CommonRoutesConfig {
  constructor(router: Router) {
    super(router, "UsersRoutes")
  }

  configureRoutes(): Router {
    this.router.get("/me", [auth], usersController.me)

    return this.router
  }
}

export default new UsersRoutes(router).router
