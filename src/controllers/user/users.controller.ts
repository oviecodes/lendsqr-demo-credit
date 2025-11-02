import { Request, Response, NextFunction } from "express"
import user from "../../services/user"
import createError from "http-errors"
// import {
//   encryptForClient,
// fetchAndDecryptData,
// } from "../utils/encryptions/userData.encryption"

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

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      // checking
      req.body.files = req.files

      await user.usersService.updateUser(req.user.id, req.body)
      return res
        .status(200)
        .json({ success: true, message: "Profile updated successfully" })
    } catch (e: any) {
      console.log(e)
      next(createError(e))
    }
  }
}

export default new UserController()
