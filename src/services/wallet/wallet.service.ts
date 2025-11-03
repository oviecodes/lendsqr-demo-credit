import { Knex } from "knex"
import db from "../../connectors/knex.connector"
import { WalletOperation } from "../../../index"

class WalletService {
  async transaction(data: WalletOperation) {
    // get currency wallet

    const { type, fromWalletId, toWalletId, bankAccount, description, amount } =
      data

    return db.transaction(async (trx: Knex.Transaction) => {
      // const []
      // use walletId

      trx.table("WalletOperation").insert({
        type,
        fromWalletId,
        toWalletId,
        bankAccount,
        status: "pending",
        description,
      })

      // 1. Get and lock wallets
      const senderWallet = await trx("Wallet")
        .where({ id: fromWalletId })
        .forUpdate() // Lock row
        .first()

      const receiverWallet = await trx("Wallet")
        .where({ id: toWalletId })
        .forUpdate()
        .first()

      // 2. Validate
      if (senderWallet.balance < amount) {
        throw new Error("Insufficient balance")
      }

      // 3. Create operation
      const [operationId] = await trx("WalletOperation").insert({
        type: "transfer",
        fromWalletId,
        toWalletId,
        amount,
        status: "pending",
      })

      // 4. Create debit transaction
      await trx("WalletTransaction").insert({
        walletId: fromWalletId,
        amount,
        type: "debit",
        balanceBefore: senderWallet.balance,
        balanceAfter: senderWallet.balance - amount,
        referenceId: operationId,
        referenceType: "transfer",
        status: "completed",
      })

      // 5. Create credit transaction
      await trx("WalletTransaction").insert({
        walletId: toWalletId,
        amount,
        type: "credit",
        balanceBefore: receiverWallet.balance,
        balanceAfter: receiverWallet.balance + amount,
        referenceId: operationId,
        referenceType: "transfer",
        status: "completed",
      })

      // 6. UPDATE WALLET BALANCES 👈👈👈
      await trx("Wallet")
        .where({ id: fromWalletId })
        .decrement("balance", amount)

      await trx("Wallet").where({ id: toWalletId }).increment("balance", amount)

      // 7. Mark operation complete
      await trx("WalletOperation")
        .where({ id: operationId })
        .update({ status: "completed" })

      return operationId
    })
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
