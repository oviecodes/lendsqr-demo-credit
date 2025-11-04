import fs, { createReadStream } from "fs"
import path from "path"

import db from "../../connectors/knex.connector"
import randomstring, { generate } from "randomstring"
import createError from "http-errors"
import { config } from "../../common/config"
import { add, sub } from "date-fns"
import argon2 from "argon2"
// import { PDFKitUtils } from "../../utils/pdfkit.utils"
import { Knex } from "knex"

class UserService {
  async createUser(data: Record<string, string>) {
    return db.table("User").insert(data, ["id"])
  }

  async createWallet(userId: string) {
    await db.table("Wallet").insert({
      userId,
    })
  }

  async me(userId: number | string) {
    return db.transaction(async (trx: Knex.Transaction) => {
      const user = await trx("User")
        .select(
          "User.id",
          "User.firstName",
          "User.email",
          "User.lastName",
          trx.raw(`
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'id', Wallet.id,
              'balance',  balance / 100.0,
              'type', Wallet.type
            )
          ) as wallets
        `)
        )
        .leftJoin("Wallet", "User.id", "Wallet.userId")
        .where("User.id", userId)
        .groupBy("User.id")
        .first()

      return user
    })
  }

  async findBy(field: string, value: string | number) {
    return db
      .table("User")
      .where(`${field}`, value)
      .select("id", "email")
      .first()
  }

  async getUserEmail(userId: string | number): Promise<any> {
    return db.table("User").where("id", userId).select("email").first()
  }
}

export default new UserService()
