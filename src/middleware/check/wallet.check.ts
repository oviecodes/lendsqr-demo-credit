import { Request, Response, NextFunction } from "express"
import createHttpError from "http-errors"
import wallet from "../../services/wallet"

export const checkUserWallet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.id = req.user.id
    req.body.fromWalletId = req.params.id
    const userWallet = await wallet.walletService.checkUserWallet(req.body)
    if (!userWallet) throw new Error()

    if (req.body.toWalletId) {
      const recieverWallet = await wallet.walletService.checkWalletExist(
        req.body.toWalletId
      )

      if (!recieverWallet) throw new Error()
    }

    return next()
  } catch (e) {
    return next(
      createHttpError.UnprocessableEntity("Cannot process transaction")
    )
  }
}
