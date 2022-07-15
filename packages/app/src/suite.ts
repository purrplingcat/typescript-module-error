import { 
  constants, 
  defineService, 
  useDefaultSchema, 
  usePubSub, 
  onSync, 
  Uid, 
  utils, 
} from "@senses/core"

export interface CommandPayload {
  entityId: Uid
  command: string
  payload: any
}

const { DEVICE_UPDATE, ROOM_UPDATE } = constants

export async function useAppSuite() {
  const pubsub = usePubSub()

  // use default senses GraphQL schema
  useDefaultSchema()

  // Handle entity sync events as GraphQL subscriptions
  /*onSync((entity) => {
    if (query.isDevice(entity)) {
      return pubsub.publish(DEVICE_UPDATE, { device: entity })
    }

    if (query.isRoom(entity)) {
      return pubsub.publish(ROOM_UPDATE, { room: entity })
    }
  })*/

  // Define execute command service
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
