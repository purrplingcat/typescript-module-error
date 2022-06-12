import { IResolvers } from "@graphql-tools/utils";
import { GraphQLJSONObject } from "graphql-type-json";
import { Room } from "../entities/Room";
import { IEntity } from "../Entity";
import { getRoom } from "../utils";
import { byRoom, isDevice } from "./query";
import { GraphQLDate, GraphQLMappedKeys } from "./scalars";
import { Context } from "./schema";

const commands = (entity: IEntity) => Array.from(entity.commands.keys())

const resolvers: IResolvers<any, Context> = {
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
  Room: {
    commands,
    devices: (room: Room, _, { senses }) => Array.from(senses.entities.values())
      .filter(isDevice)
      .filter(byRoom(room))
  },
  Device: {
    commands,
  }
}

export default resolvers
