import { Knex } from "knex"
import db from "../../connectors/knex.connector"
import { WalletOperation } from "../../../index"
import createHttpError from "http-errors"
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
      balanceAfter: receiver.balance + amount,
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

    await this.createWalletTransaction(trx, {
      walletId: toWalletId,
      amount,
      type: "credit",
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance + amount,
      referenceId: operationId,
      referenceType: type,
    })

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

    return db
      .table("WalletOperation")
      .where("reference", data.reference)
      .first()
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

  async checkUserWallet(data: WalletOperation) {
    const { id: userId, fromWalletId } = data
    return db
      .table("Wallet")
      .where("id", fromWalletId)
      .andWhere("userId", userId)
      .first()
  }

  async checkWalletExist(walletId: string) {
    return db.table("Wallet").where("id", walletId)
  }

  async getUserWallets(userId: string) {
    return db.table("Wallet").where("userId", userId)
  }
}

export default new WalletService()
