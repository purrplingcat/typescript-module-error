import pnp from "pnpapi"
import { useLogger } from "@senses/core"

const logger = useLogger("loader")
const callSetupsAsync = (setups: Function[]) => 
  Promise.all(setups.map(setup => setup()))

export async function loadModules(modules: string[]) {
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

  logger.trace(`Calling ${setups.size} setup methods asynchronously`)
  await callSetupsAsync(Array.from(setups))
}
