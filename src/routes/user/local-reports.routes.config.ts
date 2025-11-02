import express, { Router } from "express"
import { CommonRoutesConfig } from "../../common/common.routes.config"
import { auth } from "../../middleware/auth/auth"
import { validate } from "../../middleware/validator"
import UserController from "../../controllers/user"
import {
  checkCommentExists,
  checkCommentOwner,
  checkReportExists,
  getUserLocation,
} from "../../middleware/check/local-reports.check"
import { ReportFilterSchema } from "../../validators/user/local-report.validator"

const { ReportController } = UserController

const router: Router = express.Router()

class UserLocalReportsRoutes extends CommonRoutesConfig {
  constructor(router: Router) {
    super(router, "UserLocalReportsRoutes")
  }

  configureRoutes(): Router {
    // get reports - fetch users neighbourhood and council and then fetch reports
    this.router.get(
      "/",
      [auth, getUserLocation, validate(ReportFilterSchema, "query")],
      ReportController.getReports
    )

    // single report
    this.router.get(
      "/:id",
      [auth, getUserLocation, checkReportExists],
      ReportController.getReportById
    )

    // like report
    this.router.post(
      "/:id/like",
      [auth, getUserLocation, checkReportExists],
      ReportController.likeReport
    )

    // comment on report
    this.router.post(
      "/:id/comment",
      [auth, getUserLocation, checkReportExists],
      ReportController.commentOnReport
    )

    // get comments on report
    this.router.get(
      "/:id/comments",
      [auth, getUserLocation, checkReportExists],
      ReportController.getCommentsOnReport
    )

    // get comment replies
    this.router.get(
      "/comments/:commentId/replies",
      [auth, getUserLocation, checkCommentExists],
      ReportController.getCommentReplies
    )

    // like report comment
    this.router.post(
      "/comments/:commentId/like",
      [auth, getUserLocation, checkCommentExists],
      ReportController.likeComment
    )

    // edit report comment
    this.router.patch(
      "/comments/:commentId",
      [auth, getUserLocation, checkCommentExists, checkCommentOwner],
      ReportController.editComment
    )

    // delete report comment
    this.router.delete(
      "/comments/:commentId",
      [auth, getUserLocation, checkCommentExists, checkCommentOwner],
      ReportController.deleteComment
    )

    // get report by id
    // this.router.get("/:id", [auth, getUserLocation], ReportController.getReportById)

    return this.router
  }
}

export default new UserLocalReportsRoutes(router).router
