import { Request, Response, NextFunction } from "express"
import createError from "http-errors"
import Joi from "joi"

export const validate = function (
  schema: Joi.ObjectSchema<any> | Joi.ArraySchema<any[]> | Record<string, any>,
  property: "params" | "query" | "files" | "body" = "body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const options = {
      errors: {
        wrap: {
          label: "",
        },
      },
    }

    let data = req[property]

    if (property === "files" && !data) data = {}

    const { error } = schema.validate(data, options)
    const valid = error == null

    if (valid) {
      next()
    } else {
      const { details } = error
      const message = details.map((i: any) => i.message).join(",")

      next(createError.UnprocessableEntity(message))
    }
  }
}
