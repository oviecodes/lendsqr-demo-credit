import dotenv from "dotenv"
dotenv.config()

import { knex } from "knex"
import { config } from "../../knexfile"
import { attachPaginate } from "knex-paginate"

const knexInstance = knex(config[`${process.env.NODE_ENV}`])

attachPaginate()
;(async function setupPgcrypto() {
  await knexInstance.raw("CREATE EXTENSION IF NOT EXISTS pgcrypto")
})()

export default knexInstance
