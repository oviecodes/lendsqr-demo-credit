import { Knex } from "knex"

export interface Config {
  AWS_BUCKET: string
  ACCESS_TOKEN_SECRET: string
  REFRESH_TOKEN_SECRET: string
  AUTH_ISSUER_BASE_URL: string
  BUSINESS_ACCESS_TOKEN_SECRET: string
  BUSINESS_REFRESH_TOKEN_SECRET: string
  OTPSECRET: string
  ENCRYPTION_KEY: string
  MAIL_SENDER_EMAIL: string
  MAIL_SENDER_NAME: string
  MAIL_HOST: string
  MAIL_PORT: string
  MAIL_USERNAME: string
  MAIL_PASSWORD: string
  AWS_SECRET_KEY: string
  AWS_ACCESS_KEY: string
  AWS_REGION: string
  CONTACT_MAIL: string
  BUSINESS_FRONTEND_URL: string
}

export interface User {
  id: string
  email: string
  verified: Boolean
  resihubUserId: string
  buildingForumId: string
  communityForumId: string
  buildingId: string
  neighbourhoodId: string
  councilId: string
}

export interface Business {
  id: string
  email: string
  resihubBusinessId: string
}

export interface OnBoarding {
  id?: number
  question: string
  options: { id?: number; value: string; testEffect?: number; qid?: number }[]
}

export interface OnBoardingAnswers {
  question: string
  questionId: number
  answers: {
    optionId: number
    option: string
  }[]
}

export type AuthInput = {
  email: string
  password?: string
  secret?: string
  id?: number
  newDevice?: boolean
}

export interface Auth {
  strategy: AuthStrategy
  register: (data: AuthInput) => Promise<string>
  login: (data: AuthInput) => Promise<any>
  tokens: (data: any) => Promise<{ refreshToken: string; accessToken: string }>
}

export interface AuthStrategy {
  register: (data: AuthInput) => Promise<any>
  login: (data: AuthInput) => Promise<any>
  tokens: (data: any) => Promise<{ refreshToken: string; accessToken: string }>
  verifyRefreshToken: (data: any) => Promise<any>
  verifyAccessToken: (data: any) => Promise<any>
  logout: (data: any) => Promise<any>
}

export interface WalletOperation {
  id: string
  fromWalletId: string
  type: string
  amount: number
  toWalletId: string
  bankAccount: string
  description: string
}
