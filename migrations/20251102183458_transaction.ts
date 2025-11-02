import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("WalletTransaction", (table) => {
    table.uuid("id").primary().unique()
    table.uuid("walletId").notNullable().index()

    table.decimal("amount").notNullable()
    table.decimal("balanceBefore").notNullable()
    table.decimal("balanceAfter").notNullable()

    table.enum("type", ["credit", "debit"]).notNullable()
    table.string("description", 500).nullable()
    table
      .enum("status", ["pending", "completed", "failed"])
      .defaultTo("pending")
      .notNullable()

    table.string("referenceId", 100).nullable().index()
    table.string("referenceType", 50).nullable()

    table.timestamps(true, true)

    table
      .foreign("walletId")
      .references("id")
      .inTable("Wallet")
      .onDelete("CASCADE")
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("WalletTransaction")
}
