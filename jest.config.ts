import type { Config } from "jest"

const config: Config = {
  preset: "ts-jest",
  // testEnvironment: "node",
  roots: ["<rootDir>"],
  testMatch: ["**/?(*.)+(spec|test).ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  setupFiles: ["dotenv/config"],
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/tsconfig.json",
      // diagnostics: true,
    },
  },
}

export default config
