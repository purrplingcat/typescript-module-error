import express from "express"
import { useSenses, useConfig, useLogger, version } from "@senses/core";
import { startApolloServer } from "./apollo";
import { loadModules } from "./loader";
import { useAppSuite } from "./suite";

const config = useConfig()
const logger = useLogger()

export const app = express()

export default async function run() {
  logger.info(`Senses version ${version}`)
  
  useAppSuite()
  await loadModules(app, config.modules)
  await startApolloServer(app)
  useSenses().start();
}
