import request from "supertest"
import { app } from "../app"
import randomstring from "randomstring"

const base = "/v1/user/auth"

describe("Auth routes validation", () => {
  it("POST /register should 422 on missing body", async () => {
    const res = await request(app).post(`${base}/register`).send({})
    expect(res.status).toBe(422)
  })

  it("POST /register should 422 on short password", async () => {
    const res = await request(app).post(`${base}/register`).send({
      email: "test@example.com",
      password: "short",
      firstName: "John",
      lastName: "Doe",
    })
    expect(res.status).toBe(422)
  })

  it("POST /login should 422 on missing credentials", async () => {
    const res = await request(app).post(`${base}/login`).send({})
    expect(res.status).toBe(422)
  })

  it("POST /login should 422 on invalid email", async () => {
    const res = await request(app)
      .post(`${base}/login`)
      .send({ email: "not-an-email", password: "password123" })
    expect(res.status).toBe(422)
  })

  it("POST /check-email should 422 when email is invalid", async () => {
    const res = await request(app)
      .post(`${base}/check-email`)
      .send({ email: "invalid" })
    expect(res.status).toBe(422)
  })
})

describe("Auth routes validation", () => {
  it("POST /login should 401 when credentials are Invalid", async () => {
    const res = await request(app)
      .post(`${base}/login`)
      .send({ email: "test344@example.com", password: "iDontExist" })

    expect(res.status).toBe(401)
  })

  it("POST /register should return accessToken when successful", async () => {
    const res = await request(app)
      .post(`${base}/register`)
      .send({
        email: `remhga-${randomstring.generate({
          length: 8,
        })}@example.com`,
        password: "IexistNow",
        firstName: "Alecasg",
        lastName: "Gojisda",
      })

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveProperty("accessToken")
  })
})
