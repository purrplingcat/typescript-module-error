import { IResolvers } from "@graphql-tools/utils"
import { GraphQLJSONObject } from "graphql-type-json"
import { PubSubEngine, withFilter } from "graphql-subscriptions"
import { IController } from "../Entity"
import { GraphQLDate, GraphQLMappedKeys } from "./scalars"
import { Context } from "./schema"
import { DEVICE_UPDATE, ROOM_UPDATE } from "./constants"

const commands = (entity: IController) => Array.from(entity.commands.keys())

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
      commands,
      devices: (room: any, args, { senses }) => []
    },
    Device: {
      commands,
    }
  }
}

export default createResolvers
