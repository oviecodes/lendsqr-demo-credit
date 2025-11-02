import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("User", (table) => {
    table.uuid("id").primary().unique()
    table.string("email", 255).notNullable().unique().index()
    table.string("password", 255).notNullable()
    table.string("firstName", 100).notNullable()
    table.string("lastName", 100).notNullable()
    table.boolean("verified").defaultTo(false).notNullable()
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("User")
}
