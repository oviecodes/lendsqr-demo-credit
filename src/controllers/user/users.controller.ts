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

  // async updatePassword(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     await usersService.updateUserPassword({
  //       userId: req.user.id,
  //       password: req.body.password,
  //     })
  //     return res
  //       .status(200)
  //       .json({ status: true, message: "Profile updated successfully" })
  //   } catch (e) {
  //     console.log(e)
  //     next(createError.NotFound("resource not found"))
  //   }
  // }

  // async uploadProfilePicture(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     await usersService.uploadProfilePicture({
  //       files: { ...req.files, previousKey: req.body.previousKey },
  //       userId: req.user.id,
  //     })
  //     return res.status(200).json({
  //       status: true,
  //       message: "Profile picture updated",
  //     })
  //   } catch (e: any) {
  //     next(createError(e))
  //   }
  // }
  // async updateNotificationPreferences(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) {
  //   try {
  //     req.body.userId = req.user.id
  //     await usersService.updateNotificationSettings(req.body)
  //     return res.status(200).json({
  //       status: true,
  //       message: "Settings updated successfully",
  //     })
  //   } catch (e: any) {
  //     next(createError(e))
  //   }
  // }
  // async getNotificationPreferences(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ) {
  //   try {
  //     const data = await usersService.getNotificationSettings(req.user.id)
  //     return res.status(200).json({
  //       status: true,
  //       message: "User Notification preferences",
  //       data: res.locals.encryptResponse
  //         ? encryptForClient(data, req.user.publicKey)
  //         : data,
  //     })
  //   } catch (e: any) {
  //     next(createError(e))
  //   }
  // }
  // async testData(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const data = await usersService.getUserTestData(req.user.id)
  //     return res.status(200).json({
  //       status: true,
  //       message: "User test data",
  //       data: res.locals.encryptResponse
  //         ? encryptForClient(data, req.user.publicKey)
  //         : data,
  //     })
  //   } catch (e: any) {
  //     next(createError(e))
  //   }
  // }
  // async devices(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const data = await usersService.userDevices(req.user.id)
  //     return res.status(200).json({
  //       status: true,
  //       message: "User device activities",
  //       data: res.locals.encryptResponse
  //         ? encryptForClient(data, req.user.publicKey)
  //         : data,
  //     })
  //   } catch (e: any) {
  //     next(createError(e))
  //   }
  // }
  // async healthReport(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     req.body.userId = req.user.id
  //     req.body.settings = req.query
  //     await usersService.healthReport(req.body)
  //     return res.status(200).json({
  //       status: true,
  //       message: "User health report is being processed",
  //     })
  //   } catch (e: any) {
  //     next(createError(e))
  //   }
  // }
  // async exportData(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     await usersService.exportUserData(req.user.id)
  //     return res.status(200).json({
  //       status: true,
  //       message: "User data is being processed for export",
  //     })
  //   } catch (e: any) {
  //     next(createError(e))
  //   }
  // }
  // async deleteAccount(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     await usersService.intiateUserAccountDeletion(req.user.id)
  //     return res.status(200).json({
  //       status: true,
  //       message: "Account deletion is being processed",
  //     })
  //   } catch (e: any) {
  //     next(createError(e))
  //   }
  // }
  // async myStatus(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const data = await usersService.getUserStatus(req.user.id)
  //     return res.status(200).json({
  //       status: true,
  //       message: "User Status",
  //       data,
  //     })
  //   } catch (e: any) {
  //     next(createError(e))
  //   }
  // }
  // // async allInterests(req: Request, res: Response, next: NextFunction) {
  // //   try {
  // //     await usersService.allInterests()
  // //   } catch (e: any) {
  // //     next(createError(e))
  // //   }
  // // }
  // async getUserInterests(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const data = await usersService.getUserInterests(req.user.id)
  //     return res.status(200).json({
  //       status: true,
  //       message: "User Interest",
  //       data: res.locals.encryptResponse
  //         ? encryptForClient(data, req.user.publicKey)
  //         : data,
  //     })
  //   } catch (e: any) {
  //     next(createError(e))
  //   }
  // }
  // async addUserInterest(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     req.body.userId = req.user.id
  //     const data = await usersService.addUserInterest(req.body)
  //     return res.status(200).json({
  //       status: true,
  //       message: "User interest added successfully",
  //       data,
  //     })
  //   } catch (e: any) {
  //     next(createError(e))
  //   }
  // }
  // async throeErr() {
  //   throw new Error("Somethong went wrong")
  // }
}

export default new UserController()
