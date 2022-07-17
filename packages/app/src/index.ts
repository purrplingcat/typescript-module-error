import {
  db,
  hook,
  configure,
  useContext,
  useSenses,
  useConfig,
  useLogger,
} from "@senses/core";
import { startApolloServer } from "./apollo";
import { loadModules } from "./loader";
import { useAppSuite } from "./suite";
import "./context";

export async function run() {
  const context = useContext()
  const config = useConfig()
  const logger = useLogger()

  logger.info(`Senses version ${context.get("version")}`)
  await db.connect(config.db?.uri, config.db?.options)
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
