import Joi from "joi"

const register = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(7).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
})

const login = Joi.object({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(7).required(),
})

const refresh = Joi.object({
  token: Joi.string().required(),
})

const checkEmail = Joi.object({
  email: Joi.string().email().lowercase().required(),
})

const authSchema = {
  login,
  register,
  refresh,
  checkEmail,
}

export default authSchema
