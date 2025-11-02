import { NextFunction, Request, Response } from "express"
import AuthConfig from "../../lib/authentication.lib"
import createError from "http-errors"
import { Socket } from "socket.io"
import { AUTH_TYPES } from "../../constants/auth.constants"

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization

  if (!authorization) {
    return next(createError.Unauthorized("Access token is required"))
  }

  const token = authorization.split(" ")[1]

  if (!token) {
    return next(createError.Unauthorized())
  }

  await new AuthConfig(AUTH_TYPES.LOCAL)
    .verifyAccessToken(token)
    .then((user) => {
      req.user = user
      next()
    })
    .catch((e) => {
      next(createError.Unauthorized(e.message))
    })
}

export async function socketAuth(socket: Socket, next: any) {
  const authorization = socket.handshake.headers.authorization

  if (!authorization) {
    return next(createError.Unauthorized("Access token is required"))
  }

  const token = authorization.split(" ")[1]

  if (!token) {
    return next(createError.Unauthorized())
  }

  await new AuthConfig("local")
    .verifyAccessToken(token)
    .then((user) => {
      ;(socket.request as any).user = user
      next()
    })
    .catch((e) => {
      next(createError.Unauthorized(e.message))
    })
}
