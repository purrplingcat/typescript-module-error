import { useSenses, useConfig, useLogger, version, useGraphQlServer } from "@senses/core";
import { useAppSuite } from "./suite";

const config = useConfig()
const logger = useLogger()

function useModules(modules: string[]) {
  modules.forEach((module) => {
    if (module.startsWith("./")) {
      module = module.replace("./", process.cwd())
    }

    require(module);
    logger.debug(`Loaded module: ${module}`);
  })
}

export default function run() {
  logger.info(`Senses version ${version}`)

  useAppSuite()
  useModules(config.apps)
  useGraphQlServer()
  useSenses().start();
}
