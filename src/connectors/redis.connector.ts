import { Redis } from "ioredis"
// import debug from "debug"
// const log: debug.IDebugger = debug("redis:connector")

const redis = new Redis({
  port: 6379,
  host: process.env.REDIS_URL,
  maxRetriesPerRequest: null,
})

redis.on("connect", () => {
  console.log("App connected to redis")
})

redis.on("error", (e: any) => {
  console.log(e)
  throw new Error(e)
})

redis.on("close", () => {
  process.exit()
})

export default redis
