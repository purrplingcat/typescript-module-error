import { 
  configure, 
  connectDb, 
  useContext, 
  useSenses, 
  useConfig, 
  useLogger, 
  utils,
  version,
} from "@senses/core";
import { startApolloServer } from "./apollo";
import { loadModules } from "./loader";
import { useAppSuite } from "./suite";
import "./context";

const config = useConfig()
const logger = useLogger()

export async function run() {
  logger.info(`Senses version ${version}`)
  
  const context = useContext()

  await connectDb(config.db?.uri, config.db?.options)
  await useAppSuite()
  await loadModules(config.modules)
  await configure.flush()
  await startApolloServer(
    context.get("http.app"), 
    context.get("http.server")
  )
  useSenses().start()
}

export default run
