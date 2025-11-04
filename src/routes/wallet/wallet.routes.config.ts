import { CommonRoutesConfig } from "../../common/common.routes.config"
import express, { Router } from "express"
import { auth } from "../../middleware/auth/auth"
import walletController from "../../controllers/wallet/wallet.controller"
import { walletCheck } from "../../middleware/check"
import { validate } from "../../middleware/validator"
import walletSchema from "../../validators/wallet/wallet.validator"

const router: Router = express.Router()

class WalletRoutes extends CommonRoutesConfig {
  constructor(router: Router) {
    super(router, "WalletRoutes")
  }

  configureRoutes(): Router {
    this.router.get("/", [auth], walletController.getUserWallets)

    this.router.get(
      "/:id",
      [auth, walletCheck.checkUserWallet],
      walletController.getWalletData
    )
    this.router.post(
      "/:id/transaction",
      [
        auth,
        validate(walletSchema.createTransaction),
        walletCheck.convertToCents,
        walletCheck.checkUserWallet,
      ],
      walletController.createWalletOperation
    )

    return this.router
  }
}

export default new WalletRoutes(router).router
