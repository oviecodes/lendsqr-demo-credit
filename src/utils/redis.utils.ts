import redis from "../connectors/redis.connector"
import { formEnvPrefix } from "./utils"

export const getToken = async (resourceId: number | string, type: string) => {
  const token = await redis.get(formEnvPrefix(`${type}-token-${resourceId}`))
  if (!token) return null
  return JSON.parse(token)
}

export const setToken = async (
  resourceId: number | string,
  data: Record<string, any>,
  type: string,
  expiry: number = 7 * 24 * 60 * 60
) => {
  await redis.set(
    formEnvPrefix(`${type}-token-${resourceId}`),
    JSON.stringify(data),
    "EX",
    expiry
  )
}

export const removeToken = async (
  resourceId: number | string,
  type: string
) => {
  await redis.set(
    formEnvPrefix(`${type}-token-${resourceId}`),
    JSON.stringify(null),
    "EX",
    1
  )
}

export const setVerificationCode = async (
  resourceId: number | string,
  data: Record<string, any>,
  type: string,
  expiry: number = 5 * 60
) => {
  await redis.set(
    formEnvPrefix(`${type}-code-${resourceId}`),
    JSON.stringify(data),
    "EX",
    expiry
  )
}

export const getVerificationCode = async (
  resourceId: number | string,
  type: string
) => {
  const code = await redis.get(formEnvPrefix(`${type}-code-${resourceId}`))
  if (!code) return null
  return JSON.parse(code)
}

export const removeVerificationCode = async (
  resourceId: number | string,
  type: string
) => {
  await redis.set(
    formEnvPrefix(`${type}-code-${resourceId}`),
    JSON.stringify(null),
    "EX",
    1
  )
}

export const setScheduledPublishAds = async (
  resourceId: number | string,
  data: Record<string, any>,
  expiry: number = 2 * 24 * 60 * 60 // 2 days
) => {
  await redis.set(
    formEnvPrefix(`ads-scheduled-publish:${resourceId}`),
    JSON.stringify(data),
    "EX",
    expiry
  )
}

export const getScheduledPublishAds = async (resourceId: number | string) => {
  const data = await redis.get(
    formEnvPrefix(`ads-scheduled-publish:${resourceId}`)
  )
  if (!data) return null
  return JSON.parse(data)
}

export const removeScheduledPublishAds = async (
  resourceId: number | string
) => {
  await redis.set(
    formEnvPrefix(`ads-scheduled-publish:${resourceId}`),
    JSON.stringify(null),
    "EX",
    1
  )
}

export const cacheAdAnalytics = async (
  adId: string,
  period: string,
  data: any,
  expiry: any
) => {
  await redis.set(
    formEnvPrefix(`ad-analytics-${adId}-${period}`),
    JSON.stringify(data),
    "EX",
    expiry
  )
}

export const retrieveAdAnalytics = async (adId: string, period: string) => {
  let data = await redis.get(formEnvPrefix(`ad-analytics-${adId}-${period}`))
  if (!data) return null
  // console.log("redis", data)
  return JSON.parse(data)
}

export const removeCachedAdAnalytics = async (adId: string, period: string) => {
  await redis.set(
    formEnvPrefix(`ad-analytics-${adId}-${period}`),
    JSON.stringify(""),
    "EX",
    1
  )
}
