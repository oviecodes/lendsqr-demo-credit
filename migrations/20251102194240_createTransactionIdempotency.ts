import type { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE UNIQUE INDEX idx_wallet_transaction_idempotency 
    ON \`WalletTransaction\` (\`walletId\`, \`referenceId\`, \`referenceType\`, \`type\`)
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    `DROP INDEX IF EXISTS idx_wallet_transaction_idempotency ON \`WalletTransaction\``
  )
}
