import LocalStrategy from "./local.strategy"
import { AuthStrategy } from "../../../index"

interface Exp {
  local: AuthStrategy
}

const obj: Exp = {
  local: new LocalStrategy(),
}

export default obj
