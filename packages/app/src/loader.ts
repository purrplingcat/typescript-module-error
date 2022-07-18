import pnp from "pnpapi"
import fs from "fs"
import path from "path"
import { useLogger } from "@senses/core/hooks"

const loadedModules = new Map<any, any>()
const logger = useLogger("loader")
const callSetupsAsync = (setups: Function[]) => 
  Promise.all(setups.map(setup => setup()))

function loadMeta(res: string) {
  const metaFile = path.join(res, "package.json")

  if (fs.existsSync(metaFile)) {
    return JSON.parse(fs.readFileSync(metaFile).toString())
  }
}

export async function loadModules(modules: string[]) {
  const setups: Set<Function> = new Set()

  for (let id of modules) {
    const mod = await import(pnp.resolveRequest(id, "./")!);

    if (loadedModules.has(mod)) {
      logger.warn(`Module '${id}' is already loaded as '${loadedModules.get(mod)?.id}'`)
      continue
    }

    const meta = { ...loadMeta(pnp.resolveToUnqualified(id, "./")!), ...mod.meta, id }
    const setup = mod.default || mod

    if (typeof setup === "function") {
      setups.add(setup)
    }

    loadedModules.set(mod, meta)
    logger.info(`Loaded module: ${id} (${meta.name || meta.id} ${meta.version || "0.0.0"} by ${meta.author || "anonymous"})`);
  }

  logger.trace(`Calling ${setups.size} setup methods asynchronously`)
  await callSetupsAsync(Array.from(setups))
}
