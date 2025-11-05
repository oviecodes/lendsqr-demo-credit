import request from "supertest"
import { app } from "../app"

// transfer to non-existent wallet
// withdraw more than a user balance

describe("Wallet routes", () => {
  describe("Withdraw limits (authorized)", () => {
    let token: string
    let walletId: string

    beforeAll(async () => {
      const uniq = Date.now()
      const registerRes = await request(app)
        .post("/v1/user/auth/register")
        .send({
          email: `wallet-user+${uniq}@example.com`,
          password: "password123",
          firstName: "Test",
          lastName: "User",
        })

      expect(registerRes.status).toBe(200)
      expect(registerRes.body).toHaveProperty("data.accessToken")
      token = registerRes.body.data.accessToken

      const walletsRes = await request(app)
        .get("/v1/wallet")
        .set("Authorization", `Bearer ${token}`)

      expect(walletsRes.status).toBe(200)
      expect(Array.isArray(walletsRes.body.data)).toBe(true)
      expect(walletsRes.body.data.length).toBeGreaterThan(0)
      walletId = walletsRes.body.data[0].id
    })

    it("withdraw more than a user balance", async () => {
      const res = await request(app)
        .post(`/v1/wallet/${walletId}/transaction`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          type: "withdrawal",
          amount: 100,
          description: "Attempt overdraft",
          bankAccount: "1234567890",
        })

      expect(res.status).toBe(400)
      expect(res.type).toMatch(/json/)
      expect(res.body).toHaveProperty("status", false)
      expect(typeof res.body.message).toBe("string")
    })
  })
  describe("Unauthorized access", () => {
    it("GET /v1/wallet should return 401 without token", async () => {
      const res = await request(app).get("/v1/wallet")
      expect([401, 403]).toContain(res.status)
      expect(res.type).toMatch(/json/)
      expect(res.body).toHaveProperty("status", false)
      expect(typeof res.body.message).toBe("string")
    })

    it("GET /v1/wallet/:id should return 401 without token", async () => {
      const res = await request(app).get("/v1/wallet/1")
      expect([401, 403]).toContain(res.status)
      expect(res.type).toMatch(/json/)
      expect(res.body).toHaveProperty("status", false)
    })

    it("POST /v1/wallet/:id/transaction should return 401 without token", async () => {
      const res = await request(app).post("/v1/wallet/1/transaction").send({})
      expect([401, 403]).toContain(res.status)
      expect(res.body).toHaveProperty("status", false)
    })

    it("GET /v1/wallet should return 401 when Bearer has no token", async () => {
      const res = await request(app)
        .get("/v1/wallet")
        .set("Authorization", "Bearer")
      expect([401, 403]).toContain(res.status)
      expect(res.body).toHaveProperty("status", false)
    })

    it("GET /v1/wallet should return 401 when Bearer token is empty", async () => {
      const res = await request(app)
        .get("/v1/wallet")
        .set("Authorization", "Bearer   ")
      expect([401, 403]).toContain(res.status)
      expect(res.body).toHaveProperty("status", false)
    })
  })
})
