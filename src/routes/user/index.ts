import express, { Router } from "express"
import debug from "debug"

import { CommonRoutesConfig } from "../../common/common.routes.config"
import authRoutesConfig from "./auth.routes.config"
import usersRoutesConfig from "./users.routes.config"

const router: Router = Router()
export const routes: Array<CommonRoutesConfig> = []
const log: debug.IDebugger = debug("routes")

const userRoutes = usersRoutesConfig
const authRoutes = authRoutesConfig

router.use("/", userRoutes)
router.use("/auth", authRoutes)

router.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // log(`User routes - ${err}`)
    // console.log(err)
    return res.status((err as any).status || 500).json({
      status: false,
      message: err.message,
    })
  }
)

export default router
