import { useSenses, useConfig, useLogger, version, startGraphQlServer } from "@senses/core";
import { useAppSuite } from "./suite";

const config = useConfig()
const logger = useLogger()

function useModules(modules: string[]) {
  const setups: Set<Function> = new Set()

  modules.forEach((module) => {
    if (module.startsWith("./")) {
      module = module.replace("./", process.cwd())
    }

    const mod = require(module);
    const setup = mod.setup || mod.default || mod

    if (typeof setup === "function") {
      setups.add(setup)
    }

    logger.debug(`Loaded module: ${module}`);
  })

  logger.trace(`Calling ${setups.size} setup methods`)
  setups.forEach(setup => setup())
}

export default function run() {
  logger.info(`Senses version ${version}`)

  useAppSuite()
  useModules(config.apps)
  startGraphQlServer()
  useSenses().start();
}
