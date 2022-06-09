import { defineService, Uid, utils } from "@senses/core"

export interface CommandPayload {
  entityId: Uid
  command: string
  payload: any
}

export function useAppSuite() {
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

      await utils.executeCommand(entity, p.command, p.payload)
      return {
        status: 200,
        message: "OK",
      }
    },
  })
}
