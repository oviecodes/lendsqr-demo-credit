import * as winston from "winston"
import * as expressWinston from "express-winston"

export const loggerOptions: expressWinston.LoggerOptions = {
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.json(),
    winston.format.prettyPrint(),
    winston.format.colorize({ all: true })
  ),
}

if (!process.env.DEBUG) {
  loggerOptions.meta = false // when not debugging, log requests as one-liners
}

export default expressWinston.logger(loggerOptions)
