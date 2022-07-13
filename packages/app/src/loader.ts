import pnp from "pnpapi"
import { Express } from "express"
import { useLogger } from "@senses/core"

const logger = useLogger("loader")

export async function loadModules(app: Express, modules: string[]) {
  const setups: Set<Function> = new Set()

  for (let module of modules) {
    const res = pnp.resolveToUnqualified(module, "./")
    const mod = await import(res!);
    const setup = mod.setup || mod.default || mod

    if (typeof setup === "function") {
      setups.add(setup)
    }

    logger.debug(`Loaded module: ${module}`);
  }

  logger.trace(`Calling ${setups.size} setup methods`)
  setups.forEach(setup => setup({ app }))
}
