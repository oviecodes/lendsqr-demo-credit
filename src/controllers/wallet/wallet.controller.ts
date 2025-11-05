import { Request, Response, NextFunction } from "express"
import wallet from "../../services/wallet"
import createError from "http-errors"

class WalletController {
  constructor() {}

  async getUserWallets(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await wallet.walletService.getUserWallets(req.user.id)

      return res.status(200).json({
        success: true,
        message: "All useer Wallets ",
        data,
      })
    } catch (e) {
      return next(createError[404]("No wallet found for user"))
    }
  }

  async createWalletOperation(req: Request, res: Response, next: NextFunction) {
    try {
      await wallet.walletService.transaction(req.body)

      return res.status(200).json({
        success: true,
        message: "Transaction successful",
      })
    } catch (e: any) {
      // console.log(e)
      return next(createError[400](e.message))
    }
  }

  async getWalletData(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await wallet.walletService.walletData(req.params.id)

      return res.status(200).json({
        success: true,
        message: "All Wallet Data",
        data,
      })
    } catch (e) {
      return next(createError[400]("An Error Occured"))
    }
  }
}

export default new WalletController()
