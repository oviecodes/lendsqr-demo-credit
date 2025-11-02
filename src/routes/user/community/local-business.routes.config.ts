import express, { Router } from "express"
import { CommonRoutesConfig } from "../../../common/common.routes.config"
import { auth } from "../../../middleware/auth/auth"
import { UserLocalBusinessController } from "../../../controllers/user/community"
import { localBusinessCheck } from "../../../middleware/check"
import { validate } from "../../../middleware/validator"
import localBusinessValidator from "../../../validators/user/local-business.validator"

const router: Router = express.Router()

class UserLocalBusinessRoutes extends CommonRoutesConfig {
  constructor(router: Router) {
    super(router, "UserLocalBusinessRoutes")
  }

  configureRoutes(): Router {
    // Get business ads
    this.router.get(
      "/",
      [
        auth,
        localBusinessCheck.checkUserNeighbourhood,
        validate(localBusinessValidator.getItems),
      ],
      UserLocalBusinessController.getAds
    )

    // Get business ad by id
    this.router.get(
      "/:id",
      [auth, localBusinessCheck.checkUserNeighbourhood],
      UserLocalBusinessController.getAdById
    )

    // ads impressions
    this.router.post(
      "/:id/impression",
      [auth, localBusinessCheck.checkUserNeighbourhood],
      UserLocalBusinessController.createAdImpression
    )

    // ads views
    this.router.post(
      "/:id/view",
      [auth, localBusinessCheck.checkUserNeighbourhood],
      UserLocalBusinessController.createAdView
    )

    // ads comments
    this.router.post(
      "/:id/comment",
      [
        auth,
        localBusinessCheck.checkUserNeighbourhood,
        validate(localBusinessValidator.addComment),
      ],
      UserLocalBusinessController.createAdComment
    )

    // get ad comments
    this.router.get(
      "/:id/comments",
      [auth, localBusinessCheck.checkUserNeighbourhood],
      UserLocalBusinessController.getAdComments
    )

    // delete comment
    this.router.delete(
      "/comments/:commentId",
      [auth, localBusinessCheck.checkUserNeighbourhood],
      UserLocalBusinessController.deleteComment
    )

    // update comment
    this.router.patch(
      "/comments/:commentId",
      [
        auth,
        localBusinessCheck.checkUserNeighbourhood,
        validate(localBusinessValidator.editComment),
      ],
      UserLocalBusinessController.updateComment
    )

    // ads votes
    this.router.post(
      "/:id/vote",
      [auth, localBusinessCheck.checkUserNeighbourhood],
      UserLocalBusinessController.createAdVote
    )

    // comment replies
    this.router.get(
      "/comment/:id",
      [auth, localBusinessCheck.checkUserNeighbourhood],
      UserLocalBusinessController.getCommentReplies
    )

    this.router.post(
      "/comments/:commentId/like",
      [auth, localBusinessCheck.checkUserNeighbourhood],
      UserLocalBusinessController.likeComment
    )

    return this.router
  }
}

export default new UserLocalBusinessRoutes(router).router
