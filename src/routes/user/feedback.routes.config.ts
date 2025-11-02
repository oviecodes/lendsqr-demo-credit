import express, { Router } from "express"
import { CommonRoutesConfig } from "../../common/common.routes.config"

import { auth } from "../../middleware/auth/auth"
import feedbackController from "../../controllers/user/feedback.controller"
import feedbackValidator from "../../validators/feedback.validator"
import { validate } from "../../middleware/validator"
import { checkFeedbackCategory } from "../../middleware/check/feedback.check"

const router: Router = express.Router()

class FeedbackRoutes extends CommonRoutesConfig {
  constructor(router: Router) {
    super(router, "ActivitiesRoutes")
  }

  configureRoutes(): Router {
    // this.router.get(
    //   "/categories",
    //   [auth],
    //   feedbackController.feedbackCategories
    // )

    // this.router.post(
    //   "/",
    //   [auth, validate(feedbackValidator.submitFeedback), checkFeedbackCategory],
    //   feedbackController.submitFeedback
    // )

    return this.router
  }
}

export default new FeedbackRoutes(router).router
