import { Knex } from "knex"
import db from "../../connectors/knex.connector"
import { WalletOperation } from "../../../index"
import createHttpError, { HttpErrorConstructor } from "http-errors"
import randomstring from "randomstring"

class WalletService {
  async transaction(data: WalletOperation) {
    const { type } = data

    return db.transaction(async (trx: Knex.Transaction) => {
      switch (type.toLowerCase()) {
        case "deposit":
          return this.deposit(trx, data)
        case "withdrawal":
          return this.withdraw(trx, data)
        case "transfer":
          return this.transfer(trx, data)
        default:
          return
      }
    })
  }

  async transfer(trx: Knex.Transaction, data: WalletOperation) {
    const { type, toWalletId, fromWalletId, amount, description } = data
    const sender = await this.lockAndValidateWallet(trx, fromWalletId, amount)
    const receiver = await this.lockWallet(trx, toWalletId!)

    const operationId = await this.createOperation(trx, {
      reference: randomstring.generate({
        length: 10,
        charset: "alphabetic",
        capitalization: "lowercase",
      }),
      type: type,
      fromWalletId,
      toWalletId,
      amount,
    })

    await this.createWalletTransaction(trx, {
      walletId: fromWalletId,
      amount,
      type: "debit",
      balanceBefore: sender.balance,
      balanceAfter: sender.balance - amount,
      referenceId: operationId,
      referenceType: type,
    })

    await this.createWalletTransaction(trx, {
      walletId: toWalletId,
      amount,
      type: "credit",
      balanceBefore: receiver.balance,
      balanceAfter: Number(receiver.balance) + Number(amount),
      referenceId: operationId,
      referenceType: type,
    })

    await this.updateWalletBalance(trx, fromWalletId, -amount)
    await this.updateWalletBalance(trx, toWalletId!, amount)

    return operationId
  }

  async deposit(trx: Knex.Transaction, data: WalletOperation) {
    const { type, toWalletId, amount } = data

    const wallet = await this.lockWallet(trx, toWalletId)

    const operationId = await this.createOperation(trx, {
      reference: randomstring.generate({
        length: 10,
        charset: "alphabetic",
        capitalization: "lowercase",
      }),
      type,
      toWalletId,
      amount,
    })

    console.log(typeof amount)

    console.log(wallet.balance, amount, Number(wallet.balance) + Number(amount))

    await this.createWalletTransaction(trx, {
      walletId: toWalletId,
      amount,
      type: "credit",
      balanceBefore: wallet.balance,
      balanceAfter: Number(wallet.balance) + amount,
      referenceId: operationId,
      referenceType: type,
    })

    console.log(amount)

    await this.updateWalletBalance(trx, toWalletId, amount)

    return operationId
  }

  async withdraw(trx: Knex.Transaction, data: WalletOperation) {
    const { type, fromWalletId, amount, description, bankAccount } = data

    const wallet = await this.lockAndValidateWallet(trx, fromWalletId, amount)

    const operationId = await this.createOperation(trx, {
      reference: randomstring.generate({
        length: 10,
        charset: "alphabetic",
        capitalization: "lowercase",
      }),
      type,
      fromWalletId,
      amount,
      bankAccount,
      description,
    })

    await this.createWalletTransaction(trx, {
      walletId: fromWalletId,
      amount,
      type: "debit",
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance - amount,
      referenceId: operationId,
      referenceType: type,
    })

    await this.updateWalletBalance(trx, fromWalletId, -amount)

    return operationId
  }

  async walletData(walletId: string) {
    try {
      const [walletData, walletHistory] = await Promise.all([
        db
          .table("Wallet")
          .where("id", walletId)
          .select(
            "*",
            db.raw("CAST(balance / 100.0 as Decimal(10, 2)) as balance")
          )
          .first(),
        db
          .table("WalletTransaction")
          .where("walletId", walletId)
          .select(
            "*",
            db.raw(
              "CAST(balanceBefore / 100.0 as Decimal(10, 2)) as balanceBefore"
            ),
            db.raw(
              "CAST(balanceAfter / 100.0 as Decimal(10, 2)) as balanceAfter"
            ),
            db.raw("CAST(amount / 100.0 as Decimal(10, 2)) as amount")
          )
          .orderBy("created_at", "desc"),
      ])

      return {
        ...walletData,
        walletHistory,
      }
    } catch (e) {
      console.log(e)
      return createHttpError[404]("Invalid request")
    }
  }

  private async lockAndValidateWallet(
    trx: Knex.Transaction,
    walletId: string,
    requiredAmount: number
  ) {
    const wallet = await trx("Wallet")
      .where({ id: walletId })
      .forUpdate()
      .first()

    if (!wallet) {
      throw new createHttpError.NotFound("Wallet not found")
    }

    if (wallet.balance < requiredAmount) {
      throw new createHttpError.BadRequest("Insufficient balance")
    }

    return wallet
  }

  private async lockWallet(trx: Knex.Transaction, walletId: string) {
    const wallet = await trx("Wallet")
      .where({ id: walletId })
      .forUpdate()
      .first()

    if (!wallet) {
      throw new createHttpError.NotFound("Wallet not found")
    }

    return wallet
  }

  private async createOperation(trx: Knex.Transaction, data: any) {
    await trx("WalletOperation").insert({ ...data, status: "completed" })

    const operation = await trx
      .table("WalletOperation")
      .where("reference", data.reference)
      .first()

    return operation.id
  }

  private async createWalletTransaction(trx: Knex.Transaction, data: any) {
    await trx("WalletTransaction").insert({
      ...data,
      status: "completed",
    })
  }

  private async updateWalletBalance(
    trx: Knex.Transaction,
    walletId: string,
    amount: number
  ) {
    if (amount > 0) {
      await trx("Wallet").where({ id: walletId }).increment("balance", amount)
    } else {
      await trx("Wallet")
        .where({ id: walletId })
        .decrement("balance", Math.abs(amount))
    }
  }

  async checkUserWallet(data: { userId: string; walletId: string }) {
    const { userId, walletId } = data
    return db
      .table("Wallet")
      .where("id", walletId)
      .andWhere("userId", userId)
      .first()
  }

  async checkWalletExist(walletId: string) {
    return db.table("Wallet").where("id", walletId)
  }

  async getUserWallets(userId: string) {
    return db
      .table("Wallet")
      .where("userId", userId)
      .select(
        "*",
        db.raw("CAST(balance / 100.0 as Decimal(10, 2)) as balance ")
      )
  }
}

export default new WalletService()
