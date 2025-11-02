import { Request, Response, NextFunction } from "express"
import createHttpError from "http-errors"
import users from "../../services/user"
import db from "../../connectors/knex.connector"

export const checkAuthType = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.type != "local") return next()

  if (!req.body.email || !req.body.password)
    return next(
      createHttpError.UnprocessableEntity("Please provide email and password")
    )

  next()
}

export const checkEmailExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = await users.usersService.findBy("email", req.body.email)
  if (!id) return next()

  return next(createHttpError[422]("Email address already exists"))
}

export const checkUserDeviceId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await users.usersService.findBy("email", req.body.email)
  if (!user.length) return next(createHttpError[404]("Resource not found"))

  let metaData = await users.usersService.getUserDeviceId(user[0].id)

  if (!metaData.length) {
    metaData = [{}]
    metaData[0].deviceId = null
  }

  //create new user login Activity
  await users.authService.createLoginActivity(user[0].id, req.headers)

  if (metaData[0].deviceId !== req.body.deviceId) {
    //create login email notification - alert user to new login
    console.log("new device login")
    req.body.newDevice = true
  }

  next()
}

export const checkUserFomEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await users.usersService.findBy("email", req.body.email)
  if (!user.length) return next(createHttpError.NotFound("Resource not found"))

  req.body.userId = user[0].id
  req.body.portaulUserId = user[0].portaulUserId
  next()
}

export const checkAdminWardCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const adminWard = await db
    .table("Neighbourhood")
    .where("adminWardCode", req.body.location.adminWardCode)
    .first()

  if (!adminWard)
    return next(createHttpError.NotFound("Invalid admin ward code"))

  req.body.location.neighbourhoodId = adminWard.id
  delete req.body.location.adminWardCode

  next()
}
