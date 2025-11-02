import express from "express"
import * as http from "http"

import dotenv from "dotenv"

dotenv.config()

import cors from "cors"
import debug from "debug"
import fileUpload from "express-fileupload"

import logger from "./src/common/logger"
import { CommonRoutesConfig } from "./src/common/common.routes.config"
import router, { routes } from "./src/routes"
import path from "path"

const app: express.Application = express()
const server: http.Server = http.createServer(app)
const port = process.env.PORT || 3000
const debugLog: debug.IDebugger = debug("app:server")

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB - change on server nginx
  })
)

app.use(cors())
app.use(logger)

app.use((req, res, next) => {
  // convert email to lowercase
  if (req.body.email) req.body.email = req.body.email.toLowerCase()
  next()
})

const runningMessage = `Server running at http://localhost:${port}`

app.get("/", (req: express.Request, res: express.Response, next) => {
  return res.status(200).json({
    status: true,
    message: `${process.env.NODE_ENV}-DEMO-CREDIT API v1.0`,
  })
})

app.use("/v1", router)

server.listen(port, () => {
  console.log(runningMessage)

  routes.forEach((route: CommonRoutesConfig) => {
    console.log(`Routes configured for ${route.getName()}`)
  })
})
