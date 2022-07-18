import { isNil } from "./utils"

const metadataKey = Symbol()

interface InjectableClass {
  new(...args: any[]): any
  [metadataKey]: any[]
}

export type BindingScope = "singleton" | "transient"
export type Newable<T> = new (...args: any[]) => T

export interface Binding<TActivated> {
  scope: BindingScope
  activated: boolean
  cache?: TActivated
  factory: (context: Context) => TActivated
}

export interface ToBindingSyntax<T> {
  to(constructor: Newable<T>): void
  toFactory(factory: () => T): void
  toConstantValue(value: T): void
}

function getMetadata(target: any): any[] {
  return target[metadataKey] || []
}

class ToBindingSyntaxImpl<T> implements ToBindingSyntax<T> {
  private _binding: Binding<T>

  constructor(binding: Binding<T>) {
    this._binding = binding
  }

  to(constructor: Newable<T>): void {
    this._binding.factory = (ctx) => {
      const meta = getMetadata(constructor)
      return new constructor(...meta.map((a) => ctx.get(a)))
    }
  }

  toFactory(factory: (context: Context) => T): void {
    this._binding.factory = factory
  }

  toConstantValue(value: T): void {
    this._binding.factory = () => value
  }
}

export function Inject(value: any) {
  return function (target: InjectableClass, key: PropertyKey, paramIndex: number) {
    target[metadataKey] = Object.assign(target[metadataKey] || [], { [paramIndex]: value });
  }
}

export class Context {
  private _bindings = new Map<PropertyKey, Binding<unknown>>()

  bind<T>(key: PropertyKey, scope: BindingScope = "singleton") {
    const binding: Binding<T> = {
      scope,
      activated: false,
      factory() {
        throw new Error(`Unimplemented factory on binding ${String(key)}`)
      },
    }

    this._bindings.set(key, binding)

    return new ToBindingSyntaxImpl<T>(binding)
  }

  unbind(key: PropertyKey) {
    if (this.isBound(key)) {
      this._bindings.delete(key)
    }
  }

  isBound(key: PropertyKey) {
    return this._bindings.has(key)
  }

  get<T>(key: PropertyKey) {
    const binding = this._bindings.get(key) as Binding<T>

    if (isNil(binding)) throw new Error(`Unknown binding: ${String(key)}`)

    return this._activate(binding)
  }

  async provide<T>(key: PropertyKey): Promise<T> {
    return Promise.resolve()
      .then(() => this.get(key))
  }

  resolve<T>(key: PropertyKey, factory: (context: Context) => T, scope: BindingScope = "singleton") {
    if (!this.isBound(key)) {
      this.bind(key, scope).toFactory(factory)
    }

    return this.get<T>(key)
  }

  async resolveProvider<T>(key: PropertyKey, factory: (context: Context) => T, scope: BindingScope = "singleton"): Promise<T> {
    return Promise.resolve()
      .then(() => this.resolve(key, factory, scope))
  }

  private _activate<T>(binding: Binding<T>) {
    const activated = binding.activated

    binding.activated = true

    switch (binding.scope) {
      case "transient":
        return binding.factory(this)
      case "singleton":
        if (!activated) {
          binding.cache = binding.factory(this)
        }

        return <T>binding.cache
      default:
        throw new Error(`Invalid scope ${binding.scope}`)
    }
  }
}
