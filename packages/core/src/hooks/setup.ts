import { createMarker, isDefined } from "../utils"

const configurators: Provider[] = []
const needsFlush = () => configurators.length > 0
const useAll = (providers: Provider[]) => Promise.all(providers.map(p => use(p)))

export type factory<TExports> = () => Promise<TExports> | TExports

export interface Provider<TExports = unknown> {
  (): Promise<TExports>
  pre(configure: Provider): this
  post(configure: Provider): this
  used: boolean
}

export function configure<TExports>(factory: factory<TExports>) {
  const configurator = create(factory)

  configurators.push(configurator)

  return configurator
}

function create<TExports>(factory: factory<TExports>): Provider<TExports> {
  const pres: Provider[] = []
  const posts: Provider[] = []
  let cache: TExports

  const provider: Provider<TExports> = async function(): Promise<TExports> {
    if (!provider.used) {
      await useAll(pres)
      cache = await factory()
      provider.used = true
      await useAll(posts)
    }

    return cache
  }

  provider.used = false
  provider.pre = (p) => {
    pres.push(p)
    return provider
  }
  provider.post = (p) => {
    posts.push(p)
    return provider
  }

  return provider
}

async function use<T>(provider: Provider<T>) {
  if (provider && !provider.used) {
    return await provider()
  }
}

async function flush() {
  while (configurators.length > 0) {
    const provider = configurators.shift()
    
    if (isDefined(provider)) {
      await use(provider)
    }
  }
}

configure.create = create
configure.flush = flush
configure.needsFlush = needsFlush
configure.use = use
configure.useAll = useAll
