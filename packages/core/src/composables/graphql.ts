import typeDefs from "../graphql/schema"
import resolvers from "../graphql/resolvers"
import { makeExecutableSchema } from "@graphql-tools/schema";
import { IResolvers, TypeSource } from "@graphql-tools/utils";
import { flatten, isDefined } from "../utils";
import { GraphQLSchema } from "graphql";
import useLogger from "./logger";

const modules: GraphQlModule<any>[] = [{ typeDefs, resolvers }]

export type GraphQlModule<TContext> = {
  typeDefs?: TypeSource
  resolvers?: IResolvers<any, TContext> | Array<IResolvers<any, TContext>>
  augment?: (schema: GraphQLSchema) => GraphQLSchema
}

export function useModule<TContext>(module: GraphQlModule<TContext>) {
  if (!modules.includes(module)) {
    modules.push(module)
  }
}

export function createSchema() {
  const logger = useLogger("graphql")
  let schema = makeExecutableSchema({ 
    typeDefs: flatten(modules.map(m => m.typeDefs).filter(isDefined)),
    resolvers: flatten(modules.map(m => m.resolvers).filter(isDefined)),
  })

  for (const mod of modules) {
    if (typeof mod.augment === "function") {
      schema = mod.augment(schema)
    }
  }

  logger.trace(`Using ${modules.length} schema modules`)

  return schema
}
