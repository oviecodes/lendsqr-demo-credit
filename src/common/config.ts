import { Config } from "../../index"
import dotenv from "dotenv"
dotenv.config()

// Ensure that the required environment variables are set
const requiredEnvVars = [
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "AUTH_ISSUER_BASE_URL",
] as const

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Environment variable ${envVar} is missing`)
  }
})

// Export the validated and typed environment variables
export const config: Config = {
  AWS_BUCKET: process.env.AWS_BUCKET as string,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
  AUTH_ISSUER_BASE_URL: process.env.AUTH_ISSUER_BASE_URL as string,
  BUSINESS_ACCESS_TOKEN_SECRET: process.env
    .BUSINESS_ACCESS_TOKEN_SECRET as string,
  BUSINESS_REFRESH_TOKEN_SECRET: process.env
    .BUSINESS_REFRESH_TOKEN_SECRET as string,
  OTPSECRET: process.env.OTPSECRET as string,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY as string,
  MAIL_HOST: process.env.MAIL_HOST as string,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD as string,
  MAIL_PORT: process.env.MAIL_PORT as string,
  MAIL_SENDER_EMAIL: process.env.MAIL_SENDER_EMAIL as string,
  MAIL_SENDER_NAME: process.env.MAIL_SENDER_NAME as string,
  MAIL_USERNAME: process.env.MAIL_USERNAME as string,
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY as string,
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY as string,
  AWS_REGION: process.env.AWS_REGION as string,
  CONTACT_MAIL: process.env.CONTACT_MAIL as string,
  BUSINESS_FRONTEND_URL: process.env.BUSINESS_FRONTEND_URL as string,
}

//
