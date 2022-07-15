import express from "express"
import http from "http"
import { configure, useSenses, useConfig, useLogger, version } from "@senses/core";
import { startApolloServer } from "./apollo";
import { loadModules } from "./loader";
import { useAppSuite } from "./suite";

const config = useConfig()
const logger = useLogger()
const useKernel = () => Promise.all([
  useAppSuite()
])

export const app = express()
export const httpServer = http.createServer(app)

export async function run() {
  logger.info(`Senses version ${version}`)
  
  await useKernel()
  await loadModules(config.modules)
  await configure.flush()
  await startApolloServer(app, httpServer)
  useSenses().start()
}

export default run
