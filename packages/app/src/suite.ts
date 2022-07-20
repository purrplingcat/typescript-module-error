import { constants, utils, } from "@senses/core"
import { useDefaultSchema, usePubSub } from "@senses/core/hooks"

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
}
