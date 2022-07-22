const NOT_SET = {}

export function has(collection: any, key: string): boolean {
  return typeof collection.has === "function"
    ? collection.has(key)
    : collection.hasOwnProperty(key)
}

export function get<T>(collection: any, key: string, notSetValue?: T): T {
  return !has(collection, key)
    ? notSetValue
    : typeof collection.get === 'function'
    ? collection.get(key)
    : collection[key];
}

export function getIn<T>(collection: any, keyPath: string[], notSetValue?: T) {
  let i = 0;

  while (i !== keyPath.length) {
    collection = get(collection, keyPath[i++], NOT_SET);
    if (collection === NOT_SET) {
      return notSetValue;
    }
  }

  return collection;
}

export function mapEntries<S, T>(source: Record<string, S>, mapper: (v: S) => T): Record<string, T> {
  const target: Record<string, T> = {}
  
  for (const entry of Object.entries(source)) {
    target[entry[0]] = mapper(entry[1])
  }

  return target;
}

export interface HookAction {
  (...args: any[]): void
  on(cb: Function): this
  off(cb: Function): this
}

export function createHook() {
  const listeners: Set<Function> = new Set()
  const hook: HookAction = function (...args: any[]) {
    listeners.forEach(l => l(...args))
  }

  hook.on = (cb) => {
    listeners.add(cb)
    return hook;
  }

  hook.off = (cb) => {
    listeners.delete(cb)
    return hook
  }

  return hook
}

export type PureOptions = {
  nulls?: boolean;
  underscores?: boolean;
};

export function isDefined<T>(val: T | null | undefined): val is T {
  return !isNil(val);
}

export function isNil<T>(val: T | null | undefined): val is null | undefined {
  return val === null || typeof val === "undefined";
}

export function isPromiseLike<T>(target: T | PromiseLike<T>): target is PromiseLike<T> {
  return target != null && typeof (target as any).then === 'function'
}

export function flatten<T>(arr: T[]): T extends (infer A)[] ? A[] : T[] {
  return Array.prototype.concat(...arr) as any;
}

export function pure<T extends Record<string | number | symbol, unknown>>(obj: T, opts?: PureOptions): T {
  for (const key of Object.keys(obj)) {
      const isUndefined = obj[key] === undefined;
      const isNull = opts?.nulls && obj[key] === null;
      const isUnderscore = opts?.underscores && key.startsWith("_");

      if (isUndefined || isNull || isUnderscore) {
        delete obj[key];
      }
  }

  return obj;
}

export function mapObject<T>(arr: T[], selector: (v: T) => PropertyKey) {
  return arr.reduce((acc, val) => ({...acc, [selector(val)]: val}), {})
}

export function createMarker(mark: PropertyKey) {
  const marker = (target: object): boolean => {
    if (marker.signed(target)) return false;
    
    Reflect.defineProperty(target, mark, {
      value: true,
      configurable: false,
      writable: false,
    })

    return true
  }

  marker.signed = (target: object) => Reflect.has(target, mark)

  return marker
}
