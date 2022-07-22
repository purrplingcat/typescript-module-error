import { IResolvers, GraphQLJSONObject, GraphQLDate, GraphQLMappedKeys } from "@senses/graphql"
import { PubSubEngine, withFilter } from "graphql-subscriptions"
import { Context } from "./schema"
import { DEVICE_UPDATE, ROOM_UPDATE } from "./constants"

function createResolvers(pubsub: PubSubEngine): IResolvers<any, Context> {
  return {
    Date: GraphQLDate,
    JObject: GraphQLJSONObject,
    Keys: GraphQLMappedKeys,
    Query: {
      rooms: (_parent, _args, { senses }) => [],
      room: (_parent, args, { senses }) => null,
    },
    Subscription: {
      device: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(DEVICE_UPDATE),
          ({ device }, args) => device.id === args.id
        )
      },
      room: {
        subscribe: withFilter(
          () => pubsub.asyncIterator(ROOM_UPDATE),
          ({ room }, args) => room.id === args.id
        )
      }
    },
    Room: {
      devices: (room: any, args, { senses }) => []
    },
    Device: {}
  }
}

export default createResolvers
