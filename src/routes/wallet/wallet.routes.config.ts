import { CommonRoutesConfig } from "../../common/common.routes.config"
import express, { Router } from "express"
import { auth } from "../../middleware/auth/auth"

const router: Router = express.Router()

class WalletRoutes extends CommonRoutesConfig {
  constructor(router: Router) {
    super(router, "WalletRoutes")
  }

  configureRoutes(): Router {
    this.router.get("/", [auth])
    this.router.post("/transaction", [auth])

    return this.router
  }
}

export default new WalletRoutes(router).router
