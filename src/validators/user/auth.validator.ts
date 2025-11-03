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

const verify = Joi.object({
  email: Joi.string().email().lowercase().required(),
  token: Joi.string().required(),
})

const refresh = Joi.object({
  token: Joi.string().required(),
})

const checkEmail = Joi.object({
  email: Joi.string().email().lowercase().required(),
})

const passkey = Joi.object({
  email: Joi.string().email().lowercase().required(),
  passKey: Joi.string().required(),
  publicKey: Joi.string().required(),
  deviceId: Joi.string().required(),
})

const authSchema = {
  login,
  register,
  verify,
  refresh,
  checkEmail,
  passkey,
}

export default authSchema
