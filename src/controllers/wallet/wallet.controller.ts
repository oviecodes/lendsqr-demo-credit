import { Request, Response, NextFunction } from "express"
import createError from "http-errors"

class WalletController {
  constructor() {}

  async fund(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (e) {
      return createError[400]("An Error Occured")
    }
  }

  async withdraw(req: Request, res: Response, next: NextFunction) {}

  async transfer(req: Request, res: Response, next: NextFunction) {}
}

export default new WalletController()
