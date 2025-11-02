import express, { Router } from "express"
import { CommonRoutesConfig } from "../../../common/common.routes.config"
import { auth } from "../../../middleware/auth/auth"
import userController from "../../../controllers/user"
import { validate } from "../../../middleware/validator"
import forumValidator from "../../../validators/user/forum.validator"
import { forumCheck } from "../../../middleware/check"
import buildingValidator from "../../../validators/user/building.validator"

const router: Router = express.Router()

class UserBuildingForumRoutes extends CommonRoutesConfig {
  constructor(router: Router) {
    super(router, "UserBuildingForumRoutes")
  }

  configureRoutes(): Router {
    // building forum posts
    this.router.get(
      "/post",
      [
        auth,
        forumCheck.getUserBuildingForumId,
        validate(forumValidator.getPosts, "query"),
      ],
      userController.UserBuildingForumController.getForumPosts
    )

    this.router.post(
      "/post",
      [
        auth,
        forumCheck.getUserBuildingForumId,
        validate(forumValidator.createForumPost),
        validate(forumValidator.createForumPostFile, "files"),
      ],
      userController.UserBuildingForumController.createForumPost
    )

    this.router.get(
      "/post/:postId",
      [auth, forumCheck.getUserBuildingForumId, forumCheck.checkPostExists],
      userController.UserBuildingForumController.getSingleForumPost
    )

    this.router.patch(
      "/post/:postId",
      [
        auth,
        forumCheck.getUserBuildingForumId,
        forumCheck.checkPostExists,
        forumCheck.checkPostBelongsToUser,
        validate(forumValidator.editForumPost),
        validate(forumValidator.editForumPostFile, "files"),
      ],
      userController.UserBuildingForumController.editForumPost
    )

    this.router.delete(
      "/post/:postId",
      [
        auth,
        forumCheck.getUserBuildingForumId,
        forumCheck.checkPostExists,
        forumCheck.checkPostBelongsToUser,
      ],
      userController.UserBuildingForumController.deleteForumPost
    )

    this.router.get(
      "/post/:postId/comment",
      [auth, forumCheck.getUserBuildingForumId, forumCheck.checkPostExists],
      userController.UserBuildingForumController.getSinglePostComments
    )

    this.router.post(
      "/post/:postId/comment",
      [
        auth,
        validate(forumValidator.createComment),
        forumCheck.getUserBuildingForumId,
        forumCheck.checkPostExists,
      ],
      userController.UserBuildingForumController.createComment
    )

    this.router.post(
      "/comment/:commentId/like",
      [auth, forumCheck.getUserBuildingForumId, forumCheck.checkCommentExists],
      userController.UserBuildingForumController.toggleCommentLike
    )

    this.router.get(
      "/comment/:commentId",
      [auth, forumCheck.getUserBuildingForumId, forumCheck.checkCommentExists],
      userController.UserBuildingForumController.getComment
    )

    this.router.patch(
      "/comment/:commentId",
      [
        auth,
        forumCheck.getUserBuildingForumId,
        forumCheck.checkCommentExists,
        forumCheck.checkCommentBelongsToUser,
        validate(forumValidator.editComment),
      ],
      userController.UserBuildingForumController.editComment
    )

    this.router.delete(
      "/comment/:commentId",
      [
        auth,
        forumCheck.getUserBuildingForumId,
        forumCheck.checkCommentExists,
        forumCheck.checkCommentBelongsToUser,
      ],
      userController.UserBuildingForumController.deleteComment
    )

    this.router.post(
      "/post/:postId/vote",
      [
        auth,
        forumCheck.getUserBuildingForumId,
        forumCheck.checkPostExists,
        validate(forumValidator.postVote),
      ],
      userController.UserBuildingForumController.togglePostVote
    )

    this.router.post(
      "/post/:postId/view",
      [auth, forumCheck.getUserBuildingForumId, forumCheck.checkPostExists],
      userController.UserBuildingForumController.recordPostView
    )

    return this.router
  }
}

export default new UserBuildingForumRoutes(router).router
