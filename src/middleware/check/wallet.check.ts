import { Request, Response, NextFunction } from "express"
import createHttpError from "http-errors"
import wallet from "../../services/wallet"

export const convertToCents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.body.amount = req.body.amount * 100
  return next()
}

export const checkUserWallet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    req.body.userId = req.user.id
    if (req.body.type && req.body.type.toLowerCase() === "deposit") {
      req.body.toWalletId = req.params.id
    } else {
      req.body.fromWalletId = req.params.id
    }

    const userWallet = await wallet.walletService.checkUserWallet({
      userId: req.body.userId,
      walletId:
        req.body.type === "deposit"
          ? req.body.toWalletId
          : req.body.fromWalletId || req.params.id,
    })
    if (!userWallet) throw new Error()

    if (req.body.toWalletId) {
      const recieverWallet = await wallet.walletService.checkWalletExist(
        req.body.toWalletId
      )

      if (!recieverWallet) throw new Error()
    }

    return next()
  } catch (e) {
    console.log(e)
    return next(
      createHttpError.UnprocessableEntity("Cannot process transaction")
    )
  }
}
