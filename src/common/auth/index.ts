import LocalStrategy from "./local.strategy"
import { AuthStrategy } from "../../../index"
import AdminStrategy from "./admin.strategy"
import BusinessStrategy from "./business.strategy"

interface Exp {
  local: AuthStrategy
  admin: AuthStrategy
  business: AuthStrategy
}

const obj: Exp = {
  local: new LocalStrategy(),
  admin: new AdminStrategy(),
  business: new BusinessStrategy(),
}

export default obj
