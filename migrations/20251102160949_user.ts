import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("User", (table) => {
    table.uuid("id").primary()
    table.string("email", 255).notNullable().unique().index()
    table.string("password", 255).nullable()
    table.string("firstName", 100).nullable()
    table.string("lastName", 100).nullable()
    table.boolean("verified").defaultTo(false).notNullable()
    table.string("resihubUserId", 255).nullable()
    table.string("imageKey", 500).nullable()
    table.string("imageUrl", 1000).nullable()
    table.timestamp("urlExp").nullable()
    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists("User")
}
