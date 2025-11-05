import express, { Router } from "express"
import debug from "debug"

import { CommonRoutesConfig } from "../../common/common.routes.config"
import walletRoutesConfig from "./wallet.routes.config"

const router: Router = Router()
export const routes: Array<CommonRoutesConfig> = []
const log: debug.IDebugger = debug("routes")

const walletRoutes = walletRoutesConfig

router.use("/", walletRoutes)

router.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    return res.status((err as any).status || 500).json({
      status: false,
      message: err.message,
    })
  }
)

export default router
