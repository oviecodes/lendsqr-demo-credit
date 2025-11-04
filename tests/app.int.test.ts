import request from "supertest"
import { app } from "../app"

describe("App integration", () => {
  it("GET / should return API info", async () => {
    const res = await request(app).get("/")
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty("status", true)
    expect(res.body).toHaveProperty("message")
    expect(typeof res.body.message).toBe("string")
  })

  it("GET /v1/user/auth should respond", async () => {
    const res = await request(app).get("/v1/user/auth")
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: true, message: "Auth Reached" })
  })
})
