import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("Wallet", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("(UUID())"))
    table.uuid("userId").notNullable().index()
    table.string("type").defaultTo("Naira")
    table.decimal("balance").defaultTo(0).notNullable()
    table.timestamps(true, true)

    table.foreign("userId").references("id").inTable("User").onDelete("CASCADE")
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("Wallet")
}
