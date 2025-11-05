import { Request, Response, NextFunction } from "express"
import createHttpError from "http-errors"
import users from "../../services/user"
import db from "../../connectors/knex.connector"
import axios from "axios"

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
  const adjutor = await axios.get(
    `https://adjutor.lendsqr.com/v2/verification/karma/${req.body.email}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.LENDSQR_API_KEY}`,
      },
    }
  )

  if (Number(adjutor.data.data.amount_in_contention) > 0) {
    next(
      createHttpError.BadRequest(
        "Cannot create an account - user has been found in a Loan Blacklist"
      )
    )
  }

  req.body.verified = true
  next()
}
