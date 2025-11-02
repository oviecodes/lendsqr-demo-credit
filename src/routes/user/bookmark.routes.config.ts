import express, { Router } from "express"
import { CommonRoutesConfig } from "../../common/common.routes.config"
import user from "../../controllers/user"
import { validate } from "../../middleware/validator"
import schema from "../../validators/user/bookmark.validator"
import { bookmarkCheck } from "../../middleware/check"
import { auth } from "../../middleware/auth/auth"

const router: Router = express.Router()

class BookmarkRoutes extends CommonRoutesConfig {
  constructor(router: Router) {
    super(router, "AuthRoutes")
  }

  configureRoutes(): Router {
    this.router.get(
      "/",
      [auth, bookmarkCheck.checkBookmarkType],
      user.UserBookmarkController.getBookmarks
    )
    this.router.post(
      "/",
      [auth, validate(schema.addBookmark)],
      user.UserBookmarkController.addBookmark
    )

    return this.router
  }
}

export default new BookmarkRoutes(router).router
