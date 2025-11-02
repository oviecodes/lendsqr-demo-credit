import express, { Router } from "express"
import debug from "debug"

import UserCommunityForumRoutes from "./forum.routes.config"
import UserMarketplaceRoutes from "./marketplace.routes.config"
import UserLocalBusinessRoutes from "./local-business.routes.config"

const router: Router = Router()
const log: debug.IDebugger = debug("routes")

// user community routes
router.use("/forum", UserCommunityForumRoutes)
router.use("/marketplace", UserMarketplaceRoutes)
router.use("/local-business", UserLocalBusinessRoutes)
router.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    log(`User community routes - ${err}`)
    console.log(err)
    return res.status((err as any).status || 500).json({
      status: false,
      message: err.message,
    })
  }
)

export default router
