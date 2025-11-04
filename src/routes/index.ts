import express, { Router } from "express"
import debug from "debug"

import { CommonRoutesConfig } from "../common/common.routes.config"
import userRoutes from "./user"
import walletRoutes from "./wallet"

const router: Router = Router()
export const routes: Array<CommonRoutesConfig> = []
const log: debug.IDebugger = debug("routes")

router.use("/user", userRoutes)
router.use("/wallet", walletRoutes)

router.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    log(`Global error - ${err}`)
    console.log(err)
    return res.status((err as any).status || 500).json({
      status: false,
      message: err.message,
    })
  }
)

export default router
