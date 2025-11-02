import express, { Router } from "express"
import debug from "debug"

import { CommonRoutesConfig } from "../../common/common.routes.config"
import authRoutesConfig from "./auth.routes.config"
import usersRoutesConfig from "./users.routes.config"
import feedbackRoutesConfig from "./feedback.routes.config"
import conversationRoutesConfig from "./conversation.routes.config"
import buildingRoutesConfig from "./building"
import communityRoutesConfig from "./community"
import { forumCheck } from "../../middleware/check"
import localReportsRoutesConfig from "./local-reports.routes.config"
import bookmarkRoutesConfig from "./bookmark.routes.config"
import reportContentRoutesConfig from "./report-content.routes.config"

const router: Router = Router()
export const routes: Array<CommonRoutesConfig> = []
const log: debug.IDebugger = debug("routes")

const userRoutes = usersRoutesConfig
const authRoutes = authRoutesConfig
const feedbackRoutes = feedbackRoutesConfig
const conversationRoutes = conversationRoutesConfig
const buildingRoutes = buildingRoutesConfig
const communityRoutes = communityRoutesConfig
const localReportsRoutes = localReportsRoutesConfig
const bookmarkRoutes = bookmarkRoutesConfig
const reportContentRoutes = reportContentRoutesConfig
// user routes

router.use("/", userRoutes)
router.use("/auth", authRoutes)
router.use("/feedback", feedbackRoutes)
router.use("/conversation", conversationRoutes)
router.use("/building", buildingRoutes)
router.use("/community", communityRoutes)
router.use("/local-reports", localReportsRoutes)
router.use("/bookmark", bookmarkRoutes)
router.use("/report-content", reportContentRoutes)

router.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    log(`User routes - ${err}`)
    console.log(err)
    return res.status((err as any).status || 500).json({
      status: false,
      message: err.message,
    })
  }
)

export default router
