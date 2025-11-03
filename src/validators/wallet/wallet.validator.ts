import Joi from "joi"

const createTransaction = Joi.object({
  type: Joi.string().valid("transfer", "deposit", "withdrawal").required(),
  toWalletId: Joi.string(),
  description: Joi.string(),
  amount: Joi.number().required(),
  bankAccount: Joi.number(),
})

const userSchema = {
  createTransaction,
}

export default userSchema
