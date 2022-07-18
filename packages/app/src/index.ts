import { db, hook, configure } from "@senses/core"
import { useContext, useConfig, useSenses, useLogger } from "@senses/core/hooks"
import { startApolloServer } from "./apollo"
import { loadModules } from "./loader"
import { useAppSuite } from "./suite"
import "./context"


export async function run() {
  const context = useContext()
  const config = useConfig()
  const logger = useLogger()

  logger.info(`Senses version ${context.get("version")}`)
  await db.connectDb(config.db?.uri, config.db?.options)
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
