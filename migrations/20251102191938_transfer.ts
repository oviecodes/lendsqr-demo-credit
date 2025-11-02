import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("Transfer", (table) => {
    table.uuid("id").primary().unique()
    table.uuid("fromWalletId").notNullable()
    table.uuid("toWalletId").notNullable()
    table.decimal("amount", 19, 4).notNullable()
    table
      .enum("status", ["pending", "completed", "failed"])
      .defaultTo("pending")
    table.string("description", 500).nullable()
    table.timestamps(true, true)

    table.foreign("fromWalletId").references("id").inTable("Wallet")
    table.foreign("toWalletId").references("id").inTable("Wallet")
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("Transfer")
}
