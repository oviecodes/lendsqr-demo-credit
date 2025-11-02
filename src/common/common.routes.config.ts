import express, { IRouter, Router } from "express"

export abstract class CommonRoutesConfig {
  // app: express.Application
  router: Router
  name: string

  constructor(router: Router, name: string) {
    // this.app = app
    this.router = router
    this.name = name
    this.configureRoutes()
  }

  getName() {
    return this.name
  }

  abstract configureRoutes(): Router
}
