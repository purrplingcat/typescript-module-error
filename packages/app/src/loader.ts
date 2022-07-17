import pnp from "pnpapi"
import fs from "fs"
import { useLogger } from "@senses/core"

const loadedModules: any[] = []
const logger = useLogger("loader")
const callSetupsAsync = (setups: Function[]) => 
  Promise.all(setups.map(setup => setup()))

function loadMeta(res: string) {
  const metaFile = res + "/package.json"

  if (fs.existsSync(metaFile)) {
    return JSON.parse(fs.readFileSync(metaFile).toString())
  }
}

export async function loadModules(modules: string[]) {
  const setups: Set<Function> = new Set()

  for (let id of modules) {
    const res = pnp.resolveToUnqualified(id, "./")
    const mod = await import(res!);

    if (loadedModules.includes(mod)) {
      logger.warn(`Module '${id}' is already loaded as '${mod.meta.id}'`)
      continue
    }

    const meta = mod.meta = { ...loadMeta(res!), ...mod.meta, id }
    const setup = mod.default || mod

    if (typeof setup === "function") {
      setups.add(setup)
    }

    logger.info(`Loaded module: ${id} (${meta.name || meta.id} ${meta.version || "0.0.0"} by ${meta.author || "anonymous"})`);
  }

  logger.trace(`Calling ${setups.size} setup methods asynchronously`)
  await callSetupsAsync(Array.from(setups))
}
