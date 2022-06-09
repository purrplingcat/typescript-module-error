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
