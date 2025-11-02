// reach user - using connectionId
// if start of UserConversation  return otherUser's public key

import express, { Router } from "express"
import { CommonRoutesConfig } from "../../common/common.routes.config"
import { auth } from "../../middleware/auth/auth"
import { validate } from "../../middleware/validator"
import conversationController from "../../controllers/user/conversation.controller"
import { checkConnection } from "../../middleware/check/conversation.check"

const router: Router = express.Router()

class ConversationRoutes extends CommonRoutesConfig {
  constructor(router: Router) {
    super(router, "ConversationRoutes")
  }

  //implement the middleware & checks
  configureRoutes(): Router {
    // if user message count === 0 then first message - return session encryption to recipient to engage

    //get
    // this.router.get("/:id", [auth], conversationController.getConversation)

    // // reach will handle session encryption for sender
    // this.router.post(
    //   "/reach/:id",
    //   [auth, checkConnection],
    //   conversationController.reach
    // )

    return this.router
  }
}

export default new ConversationRoutes(router).router
