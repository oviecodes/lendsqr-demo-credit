import Joi from "joi"

const register = Joi.object({
  email: Joi.string().email().lowercase().required(),
  type: Joi.any().valid("local", "google", "apple").default("local").required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  building: Joi.object({
    buildingId: Joi.string().uuid().required(),
    apartmentNumber: Joi.number().integer().required(),
  }).allow(null),
  location: Joi.object({
    adminWardCode: Joi.string().required(),
    address: Joi.string().required(),
  }),
})

const login = Joi.object({
  email: Joi.string().email().lowercase().required(),
  type: Joi.string()
    .valid("local", "google", "apple")
    .default("local")
    .required(),
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
