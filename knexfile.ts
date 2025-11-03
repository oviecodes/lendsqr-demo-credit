import type { Knex } from "knex"
import dotenv from "dotenv"

dotenv.config()

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    // debug: true,
    connection: {
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      port: parseInt(process.env.DATABASE_PORT!) || 3306,
    },
    migrations: {
      tableName: "demo_credit_migrations",
    },
  },

  production: {
    client: "mysql2",
    connection: {
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      port: parseInt(process.env.DATABASE_PORT!) || 3306,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "demo_credit_migrations",
    },
  },
}

export default config
