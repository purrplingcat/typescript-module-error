import { createMarker } from "../utils"

const configurators: Factory<unknown>[] = []
const markUsed = createMarker(Symbol("USED"))

export type Factory<TExports> = () => Promise<TExports> | TExports

export function configure<TExports>(factory: Factory<TExports>) {
  if (!markUsed.signed(factory) && !configurators.includes(factory)) {
    configurators.push()
  }

  return factory
}

configure.use = function use<TExports>(factory: Factory<TExports>): Factory<TExports> {
  let formed = false
  let exports: TExports

  return function() {
    if (!formed) {
      exports = factory()
      formed = true
    }

    return exports
  }
}

configure.flush = async function flush() {
  while (configurators.length > 0) {
    const factory = configurators.shift()
    
    if (factory && markUsed(factory)) {
      await factory()
    }
  }
}
