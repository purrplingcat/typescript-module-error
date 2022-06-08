import { defineService } from "../composables/entities";
import { Uid } from "../Entity";
import { executeCommand } from "../utils";

export interface CommandPayload {
  entityId: Uid
  command: string
  payload: any
}

export function useDefault() {
  defineService<CommandPayload, any>({
    id: "executeCommand",
    async call(p, senses) {
      const entity = senses.entities.get(p.entityId)

      if (!entity) {
        return {
          status: 404,
          message: "Entity not found",
        }
      }

      await executeCommand(entity, p.command, p.payload)
      return {
        status: 200,
        message: "OK",
      }
    },
  })
}
