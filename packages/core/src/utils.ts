import { IEntity, Uid } from "./Entity";
import { Senses } from "./Senses";
import { ServiceResult } from "./Service";

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
