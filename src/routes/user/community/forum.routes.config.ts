import express, { Router } from "express"
import { CommonRoutesConfig } from "../../../common/common.routes.config"
import { auth } from "../../../middleware/auth/auth"
import userController from "../../../controllers/user"
import { validate } from "../../../middleware/validator"
import forumValidator from "../../../validators/user/forum.validator"
import { forumCheck } from "../../../middleware/check"

const router: Router = express.Router()

class UserCommunityForumRoutes extends CommonRoutesConfig {
  constructor(router: Router) {
    super(router, "UserCommunityForumRoutes")
  }

  configureRoutes(): Router {
    // building forum posts
    this.router.get(
      "/post",
      [
        auth,
        forumCheck.getUserCommunityForumId,
        validate(forumValidator.getPosts, "query"),
      ],
      userController.UserCommunityForumController.getForumPosts
    )

    this.router.post(
      "/post",
      [
        auth,
        forumCheck.getUserCommunityForumId,
        validate(forumValidator.createForumPost),
        validate(forumValidator.createForumPostFile, "files"),
      ],
      userController.UserCommunityForumController.createForumPost
    )

    this.router.get(
      "/post/:postId",
      [auth, forumCheck.getUserCommunityForumId, forumCheck.checkPostExists],
      userController.UserCommunityForumController.getSingleForumPost
    )

    this.router.patch(
      "/post/:postId",
      [
        auth,
        forumCheck.getUserCommunityForumId,
        forumCheck.checkPostExists,
        forumCheck.checkPostBelongsToUser,
        validate(forumValidator.editForumPost),
        validate(forumValidator.editForumPostFile, "files"),
      ],
      userController.UserCommunityForumController.editForumPost
    )

    this.router.delete(
      "/post/:postId",
      [
        auth,
        forumCheck.getUserCommunityForumId,
        forumCheck.checkPostExists,
        forumCheck.checkPostBelongsToUser,
      ],
      userController.UserCommunityForumController.deleteForumPost
    )

    this.router.get(
      "/post/:postId/comment",
      [auth, forumCheck.getUserCommunityForumId, forumCheck.checkPostExists],
      userController.UserCommunityForumController.getSinglePostComments
    )

    this.router.post(
      "/post/:postId/comment",
      [
        auth,
        validate(forumValidator.createComment),
        forumCheck.getUserCommunityForumId,
        forumCheck.checkPostExists,
      ],
      userController.UserCommunityForumController.createComment
    )

    this.router.post(
      "/comment/:commentId/like",
      [auth, forumCheck.getUserCommunityForumId, forumCheck.checkCommentExists],
      userController.UserCommunityForumController.toggleCommentLike
    )

    this.router.get(
      "/comment/:commentId",
      [auth, forumCheck.getUserCommunityForumId, forumCheck.checkCommentExists],
      userController.UserCommunityForumController.getComment
    )

    // edit comment
    this.router.patch(
      "/comment/:commentId",
      [
        auth,
        forumCheck.getUserCommunityForumId,
        forumCheck.checkCommentExists,
        forumCheck.checkCommentBelongsToUser,
        validate(forumValidator.editComment),
      ],
      userController.UserCommunityForumController.editComment
    )

    // delete comment
    this.router.delete(
      "/comment/:commentId",
      [
        auth,
        forumCheck.getUserCommunityForumId,
        forumCheck.checkCommentExists,
        forumCheck.checkCommentBelongsToUser,
      ],
      userController.UserCommunityForumController.deleteComment
    )

    this.router.post(
      "/post/:postId/vote",
      [
        auth,
        validate(forumValidator.postVote),
        forumCheck.getUserCommunityForumId,
        forumCheck.checkPostExists,
      ],
      userController.UserCommunityForumController.togglePostVote
    )

    this.router.post(
      "/post/:postId/view",
      [auth, forumCheck.getUserCommunityForumId, forumCheck.checkPostExists],
      userController.UserCommunityForumController.recordPostView
    )

    return this.router
  }
}

// update size limit for files

export default new UserCommunityForumRoutes(router).router
