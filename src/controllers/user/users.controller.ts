import { Request, Response, NextFunction } from "express"
import user from "../../services/user"
import createError from "http-errors"

class UserController {
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await user.usersService.me(req.user.id)
      return res.status(200).json({
        success: true,
        message: "user profile",
        data,
      })
    } catch (e: any) {
      next(createError(e))
    }
  }
}

export default new UserController()
