import EventEmitter from "events";

export type Watcher = (key: PropertyKey, oldValue: unknown, newValue: unknown) => void;

export function observe(target: Record<PropertyKey, any>, watcher: Watcher) {
  const observer = observerOf(target)

  if (observer) {
    observer.on("change", watcher)
  }
}

export function isObservable(target: object): boolean {
  return !observerOf(target)
}

export function observerOf(target: object) {
  return Reflect.get(target, "__ob") as EventEmitter
}

export function observable<T extends Record<PropertyKey, any>>(obj?: T) {
  const observer = new EventEmitter()

  return new Proxy(obj ?? <T>{}, {
    set(target: any, p, value) {
      if (target[p] !== value) {
        const old = target[p]
        target[p] = value
        observer.emit("change", p, old, target[p])
      }

      return true
    },
    get(target, p: string) {
      if (p === "__ob") {
        return observer
      }

      return target[p]
    }
  })
}
