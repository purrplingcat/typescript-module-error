import { IResolvers } from "@graphql-tools/utils";
import { GraphQLJSONObject } from "graphql-type-json";
import { getRoom } from "../utils";
import { GraphQLDate } from "./scalars";
import { Context } from "./schema";

const resolvers: IResolvers<any, Context> = {
  Date: GraphQLDate,
  JObject: GraphQLJSONObject,
  Query: {
    rooms: (parent, args, { senses }) =>
      senses.getEntities()
        .filter((e) => e.kind === "room"),
    room: (parent, args, { senses }) =>
      getRoom(senses, args.id),
  }
}

export default resolvers
