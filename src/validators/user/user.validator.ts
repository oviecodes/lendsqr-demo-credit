import Joi from "joi"

const update = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string().email().lowercase(),
  location: Joi.object({
    adminWardCode: Joi.string(),
    address: Joi.string(),
  }),
  building: Joi.object({
    apartmentNumber: Joi.number(),
    buildingId: Joi.string().uuid(),
  }),
})

const updateEmail = Joi.object({
  email: Joi.string().email().lowercase().required(),
})

const updatePassword = Joi.object({
  password: Joi.string().min(12).required(),
})

const userSchema = {
  update,
  updateEmail,
  updatePassword,
}

export default userSchema
