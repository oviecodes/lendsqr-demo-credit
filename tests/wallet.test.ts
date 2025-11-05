import request from "supertest"
import { app } from "../app"
import randomstring from "randomstring"

// transfer to non-existent wallet
// withdraw more than a user balance

describe("Wallet routes", () => {
  describe("Withdraw limits (authorized)", () => {
    let token: string
    let walletId: string
    let toWalletId: string
    let toToken: string

    let balance: number = 0
    let transactionCount: number = 0

    beforeAll(async () => {
      const opts = {
        length: 8,
        charset: "alphabetic",
      }
      const [registerRes, secondRegisterRes] = await Promise.all([
        request(app)
          .post("/v1/user/auth/register")
          .send({
            email: `wallet-user+${randomstring.generate(opts)}@example.com`,
            password: "password123",
            firstName: "Test",
            lastName: "User",
          }),
        request(app)
          .post("/v1/user/auth/register")
          .send({
            email: `wallet-user+${randomstring.generate(opts)}@example.com`,
            password: "password123",
            firstName: "Test",
            lastName: "User",
          }),
      ])

      expect(registerRes.status).toBe(200)
      expect(registerRes.body).toHaveProperty("data.accessToken")
      token = registerRes.body.data.accessToken
      toToken = secondRegisterRes.body.data.accessToken

      const [walletsRes, secondWalletsRes] = await Promise.all([
        request(app).get("/v1/wallet").set("Authorization", `Bearer ${token}`),
        request(app)
          .get("/v1/wallet")
          .set("Authorization", `Bearer ${toToken}`),
      ])

      expect(walletsRes.status).toBe(200)
      expect(Array.isArray(walletsRes.body.data)).toBe(true)
      expect(walletsRes.body.data.length).toBeGreaterThan(0)
      walletId = walletsRes.body.data[0].id
      toWalletId = secondWalletsRes.body.data[0].id
    })

    afterAll(async () => {})

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

    it("deposit to a user wallet", async () => {
      const res = await request(app)
        .post(`/v1/wallet/${walletId}/transaction`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          type: "deposit",
          amount: 100,
          description: "Deposit",
        })

      balance += 100
      transactionCount++
      expect(res.status).toBe(200)
      expect(res.type).toMatch(/json/)
      expect(res.body).toHaveProperty("success", true)
      expect(res.body.message).toBe("Transaction successful")
    })

    it("transfer to a different user's wallet", async () => {
      const res = await request(app)
        .post(`/v1/wallet/${walletId}/transaction`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          type: "transfer",
          amount: 20,
          toWalletId,
        })

      balance -= 20
      transactionCount++
      expect(res.status).toBe(200)
      expect(res.type).toMatch(/json/)
      expect(res.body).toHaveProperty("success", true)
      expect(res.body.message).toBe("Transaction successful")
    })

    it("transfer to same wallet should fail", async () => {
      const res = await request(app)
        .post(`/v1/wallet/${walletId}/transaction`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          type: "transfer",
          amount: 20,
          toWalletId: walletId,
        })

      expect(res.status).toBe(422)
      expect(res.type).toMatch(/json/)
      expect(res.body).toHaveProperty("status", false)
      expect(res.body.message).toBe("Cannot process transaction")
    })

    it("withdrawal should work with updated balance", async () => {
      const res = await request(app)
        .post(`/v1/wallet/${walletId}/transaction`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          type: "withdrawal",
          amount: 20,
          description: "Attempt withdrawal",
          bankAccount: "1234567890",
        })

      balance -= 20
      transactionCount++
      expect(res.status).toBe(200)
      expect(res.type).toMatch(/json/)
      expect(res.body.message).toBe("Transaction successful")
    })

    it("wallet balance should match along with transaction count", async () => {
      const res = await request(app)
        .get(`/v1/wallet/${walletId}`)
        .set("Authorization", `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.type).toMatch(/json/)
      expect(res.body).toHaveProperty("success", true)
      expect(parseInt(res.body.data.balance)).toEqual(balance)
      expect(res.body.data.walletHistory.length).toEqual(3)
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
