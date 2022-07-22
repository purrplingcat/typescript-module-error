import { hook, configure } from "@senses/core"
import { useContext, useConfig, useSenses, useLogger } from "@senses/core/hooks"
import { startApolloServer } from "./graphql/apollo"
import { loadModules } from "./module/loader"
import { useAppSuite } from "./module/suite"
import "./context"
import { connectDb } from "./database/tools"

export async function run() {
  const context = useContext()
  const config = useConfig()
  const logger = useLogger()

  logger.info(`Senses version ${context.get("version")}`)
  await connectDb(config.db?.uri, config.db?.options)
  await useAppSuite()
  await loadModules(config.modules)
  await configure.flush()
    .then(() => hook.raise("configure"))
  await startApolloServer(
    context.get("http.app"),
    context.get("http.server")
  )
  useSenses().start()
}

export default run
