import { Request, Response, NextFunction } from "express"
import createHttpError from "http-errors"
import users from "../../services/user"
import db from "../../connectors/knex.connector"

export const checkEmailExists = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = await users.usersService.findBy("email", req.body.email)
  if (!id) return next()

  return next(createHttpError[422]("Email address already exists"))
}

export const checkUserFomEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await users.usersService.findBy("email", req.body.email)
  if (!user.length) return next(createHttpError.NotFound("Resource not found"))

  req.body.userId = user[0].id
  next()
}

export const checkAdjustor = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // API call to adjutor service
  next()
}
