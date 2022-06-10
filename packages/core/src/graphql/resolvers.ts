import { IResolvers } from "@graphql-tools/utils";
import { GraphQLJSONObject } from "graphql-type-json";
import { Room } from "../entities/Room";
import { getRoom } from "../utils";
import { GraphQLDate, GraphQLMappedKeys } from "./scalars";
import { Context } from "./schema";

const resolvers: IResolvers<any, Context> = {
  Date: GraphQLDate,
  JObject: GraphQLJSONObject,
  Keys: GraphQLMappedKeys,
  Query: {
    rooms: (parent, args, { senses }) =>
      senses.getEntities()
        .filter((e) => e.kind === "room"),
    room: (parent, args, { senses }) =>
      getRoom(senses, args.id),
  },
  Room: {
    commands: (parent: Room) => Array.from(parent.commands.keys())
  }
}

export default resolvers
