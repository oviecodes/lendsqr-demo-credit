import express, { Router } from "express"
import debug from "debug"

import UserBuildingForumRoutes from "./forum.routes.config"
import UserBuildingUpdatesRoutes from "./updates.routes.config"
const router: Router = Router()
const log: debug.IDebugger = debug("routes")

router.use("/forum", UserBuildingForumRoutes)
router.use("/update", UserBuildingUpdatesRoutes)

router.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    log(`User building routes - ${err}`)
    console.log(err)
    return res.status((err as any).status || 500).json({
      status: false,
      message: err.message,
    })
  }
)

export default router
