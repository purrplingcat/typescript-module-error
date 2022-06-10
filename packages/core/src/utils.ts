import EventEmitter from "events";
import { IEntity, Uid } from "./Entity";
import { Senses } from "./Senses";
import { ServiceResult } from "./Service";

const NOT_SET = {}

export function executeCommand(entity: IEntity, command: string, payload: any) {
  const action = entity.commands.get(command)

  if (!action) {
    throw Error(`Unknown command ${command} on entity ${entity.id}`)
  }

  return action(payload, entity)
}

export function callService<P, R>(senses: Senses, id: Uid, payload: P): ServiceResult<R> | Promise<ServiceResult<R>> {
  const service = senses.services.get(id)

  if (!service) {
    throw Error(`Unknown service ${id}`)
  }

  return service.call(payload, senses)
}

export function has(collection: any, key: string): boolean {
  return typeof collection.has === "function"
    ? collection.has(key)
    : collection.hasOwnProperty(key)
}

export function get<T>(collection: any, key: string, notSetValue?: T):T {
  return !has(collection, key)
    ? notSetValue
    : typeof collection.get === 'function'
    ? collection.get(key)
    : collection[key];
}

export function getIn<T>(collection: any, keyPath: string[], notSetValue: T) {
  let i = 0;

  while (i !== keyPath.length) {
    collection = get(collection, keyPath[i++], NOT_SET);
    if (collection === NOT_SET) {
      return notSetValue;
    }
  }

  return collection;
}

export function getRoom(senses: Senses, id: string) {
  const candidate = senses.entities.get(id)

  if (!candidate || candidate.kind !== "room") {
    return null
  }

  return candidate
}

export function observable<T>(obj: Record<string, T> = {}) {
  const observer = new EventEmitter()

  return new Proxy(obj, {
    set(target, p: string, newValue: T) {
      const oldValue = target[p]

      if (oldValue !== newValue) {
        target[p] = newValue
        observer.emit("change", p, newValue, oldValue, target)
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

export type Watcher<T> = (p: string, newValue: T, oldValue: T, target: Record<string, T>) => void;

export function observe<T>(target: Record<string, T>, watcher: Watcher<T>) {
  const observer: EventEmitter = Reflect.get(target, "__ob")

  if (observer) {
    observer.on("change", watcher)
  }
}

export function isObservable(target: object): boolean {
  return Reflect.has(target, "__ob")
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
