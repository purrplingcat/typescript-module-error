import { IResolvers } from "@graphql-tools/utils"
import { GraphQLJSONObject } from "graphql-type-json"
import { PubSubEngine, withFilter } from "graphql-subscriptions"
import { IEntity } from "../Entity"
import { getRoom, pure } from "../utils"
import { byRoom, byType, isDevice } from "./query"
import { GraphQLDate, GraphQLMappedKeys } from "./scalars"
import { Context } from "./schema"
import { Room } from "../entities"
import { DEVICE_UPDATE, ROOM_UPDATE } from "./constants"

const commands = (entity: IEntity) => Array.from(entity.commands.keys())
const props = (entity: IEntity) => pure({ ...entity.props }, { underscores: true })

function createResolvers(pubsub: PubSubEngine): IResolvers<any, Context> {
  return {
    Date: GraphQLDate,
    JObject: GraphQLJSONObject,
    Keys: GraphQLMappedKeys,
    Query: {
      rooms: (_parent, _args, { senses }) =>
        senses.getEntities()
          .filter((e) => e.kind === "room"),
      room: (_parent, args, { senses }) =>
        getRoom(senses, args.id),
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
      props,
      devices: (room: Room, args, { senses }) => Array.from(senses.entities.values())
        .filter(isDevice)
        .filter(byRoom(room))
        .filter(byType(args.type))
    },
    Device: {
      commands,
      props,
    }
  }
}

export default createResolvers
