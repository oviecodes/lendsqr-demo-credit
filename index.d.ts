import { User, Business } from "./src/common/common"

export * from "./src/common/common"

declare global {
  namespace Express {
    export interface Request {
      user: User
      business: Business
    }
  }
}
