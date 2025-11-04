import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("WalletOperation", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"))
    table.enum("type", ["transfer", "withdrawal", "deposit"]).notNullable()
    table.string("reference").notNullable()

    table.uuid("fromWalletId").nullable()
    table.uuid("toWalletId").nullable()

    table.decimal("amount").notNullable()
    table
      .enum("status", ["pending", "completed", "failed"])
      .defaultTo("pending")

    table.string("bankAccount", 100).nullable()
    table.string("description", 500).nullable()

    table.timestamps(true, true)

    table.foreign("fromWalletId").references("id").inTable("Wallet")
    table.foreign("toWalletId").references("id").inTable("Wallet")
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("WalletOperation")
}
