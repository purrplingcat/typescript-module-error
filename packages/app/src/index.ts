import { useSenses, useConfig, useLogger, version, loadConfig } from "@senses/core";
import { useAppSuite } from "./suite";

export default function run() {
  function useModules(modules: string[]) {
    modules.forEach((module) => {
      require(module);
      logger.debug(`Loaded module: ${module}`);
    })
  }

  const configFile = process.env.SENSES_CONFIG ?? "config/senses.yml"
  const config = useConfig(loadConfig(configFile))
  const logger = useLogger();

  logger.info(`Senses version ${version}`)

  useAppSuite()
  useModules(config.apps)
  useSenses().start();
}
