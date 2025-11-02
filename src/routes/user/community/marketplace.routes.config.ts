import { CommonRoutesConfig } from "../../../common/common.routes.config"
import express, { Router } from "express"
import { auth } from "../../../middleware/auth/auth"
import { validate } from "../../../middleware/validator"
import marketplaceValidator from "../../../validators/user/marketplace.validator"
import { UserMarketplaceItemController } from "../../../controllers/user/community"
import { forumCheck, marketplaceCheck } from "../../../middleware/check"
// import { upload } from "../../../middleware/"

const router: Router = express.Router()

class MarketplaceRoutes extends CommonRoutesConfig {
  constructor(router: Router) {
    super(router, "MarketplaceRoutes")
  }

  configureRoutes(): Router {
    // Create item
    this.router.post(
      "/items",
      [
        auth,
        marketplaceCheck.checkUserNeighbourhood,
        // upload.fields([{ name: "image", maxCount: 5 }]),
        validate(marketplaceValidator.createItem),
      ],
      UserMarketplaceItemController.createItem
    )

    // Get all items
    this.router.get(
      "/items",
      [
        auth,
        marketplaceCheck.checkUserNeighbourhood,
        validate(marketplaceValidator.getItems, "query"),
      ],
      UserMarketplaceItemController.getItems
    )

    // Get my items
    this.router.get(
      "/my-items",
      [
        auth,
        marketplaceCheck.checkUserNeighbourhood,
        validate(marketplaceValidator.getItems, "query"),
      ],
      UserMarketplaceItemController.getMyItems
    )

    // Update item
    this.router.put(
      "/items/:itemId",
      [
        auth,
        marketplaceCheck.checkUserNeighbourhood,
        marketplaceCheck.checkItemOwner,
        // upload.fields([{ name: "image", maxCount: 5 }]),
        validate(marketplaceValidator.updateItem),
      ],
      UserMarketplaceItemController.updateItem
    )

    // Update item status
    this.router.patch(
      "/items/:itemId/status",
      [
        auth,
        marketplaceCheck.checkUserNeighbourhood,
        marketplaceCheck.checkItemOwner,
        validate(marketplaceValidator.updateItemStatus),
      ],
      UserMarketplaceItemController.updateItemStatus
    )

    // Record item view
    this.router.post(
      "/items/:itemId/view",
      [auth, marketplaceCheck.checkUserNeighbourhood],
      UserMarketplaceItemController.recordItemView
    )

    // Get item
    this.router.get(
      "/items/:itemId",
      [
        auth,
        marketplaceCheck.checkUserNeighbourhood,
        marketplaceCheck.checkItemInNeighbourhood,
      ],
      UserMarketplaceItemController.getItem
    )

    // Delete item
    this.router.delete(
      "/items/:itemId",
      [
        auth,
        marketplaceCheck.checkUserNeighbourhood,
        marketplaceCheck.checkItemOwner,
      ],
      UserMarketplaceItemController.deleteItem
    )

    this.router.post(
      "/items/:itemId/comment",
      [
        auth,
        marketplaceCheck.checkUserNeighbourhood,
        marketplaceCheck.checkItemInNeighbourhood,
        validate(marketplaceValidator.createComment),
      ],
      UserMarketplaceItemController.createComment
    )

    // get comments
    this.router.get(
      "/items/:itemId/comment",
      [
        auth,
        marketplaceCheck.checkUserNeighbourhood,
        marketplaceCheck.checkItemInNeighbourhood,
      ],
      UserMarketplaceItemController.getComments
    )

    // get comment replies
    this.router.get(
      "/comment/:commentId/replies",
      [
        auth,
        marketplaceCheck.checkUserNeighbourhood,
        // marketplaceCheck.checkCommentInNeighbourhood,
      ],
      UserMarketplaceItemController.getCommentReplies
    )

    // delete comment
    this.router.delete(
      "/comment/:commentId",
      [
        auth,
        marketplaceCheck.checkUserNeighbourhood,
        marketplaceCheck.checkCommentOwner,
      ],
      UserMarketplaceItemController.deleteComment
    )

    // update comment
    this.router.patch(
      "/comment/:commentId",
      [
        auth,
        marketplaceCheck.checkUserNeighbourhood,
        marketplaceCheck.checkCommentOwner,
        validate(marketplaceValidator.updateComment),
      ],
      UserMarketplaceItemController.updateComment
    )

    // like item
    this.router.post(
      "/items/:itemId/like",
      [auth, marketplaceCheck.checkUserNeighbourhood],
      UserMarketplaceItemController.likeItem
    )

    // like comment
    this.router.post(
      "/comment/:commentId/like",
      [auth, marketplaceCheck.checkUserNeighbourhood],
      UserMarketplaceItemController.likeComment
    )

    // save item
    this.router.post(
      "/items/:itemId/save",
      [
        auth,
        marketplaceCheck.checkUserNeighbourhood,
        marketplaceCheck.checkItemInNeighbourhood,
      ],
      UserMarketplaceItemController.saveItem
    )

    this.router.get(
      "/items/saved/all",
      [auth, marketplaceCheck.checkUserNeighbourhood],
      UserMarketplaceItemController.getSavedItems
    )

    return this.router
  }
}

export default new MarketplaceRoutes(router).router
