import { createMarker } from "../utils"

const configurators: Factory<unknown>[] = []
const markUsed = createMarker(Symbol("USED"))
const needsFlush = () => configurators.length > 0

export type Factory<TExports> = () => Promise<TExports> | TExports

export function configure<TExports>(factory: Factory<TExports>) {
  const configurator = use(factory)

  configurators.push(configurator)

  return configurator
}

function use<TExports>(factory: Factory<TExports>): Factory<TExports> {
  let formed = false
  let exports: TExports

  return function () {
    if (!formed) {
      exports = factory()
      formed = true
    }

    return exports
  }
}

async function flush() {
  while (configurators.length > 0) {
    const factory = configurators.shift()

    if (factory && markUsed(factory)) {
      await factory()
    }
  }
}

configure.use = use
configure.flush = flush
configure.needsFlush = needsFlush
