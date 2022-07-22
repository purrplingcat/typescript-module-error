import typeDefs from "./schema"
import createResolvers from "./resolvers"
import { useLogger } from "@senses/core/hooks";
import { makeExecutableSchema, IResolvers, TypeSource } from "@senses/graphql";
import { createMarker, flatten, isDefined } from "@senses/core/utils";
import { GraphQLSchema } from "graphql";
import { PubSub } from "graphql-subscriptions";
import { ContextFunction } from "apollo-server-core";
import { useSenses, useContext } from "@senses/core/hooks";

const modules: GraphQlModule<any>[] = []
const markUsed = createMarker(Symbol("MARK_USED"))

export type GraphQlModule<TContext> = {
  typeDefs?: TypeSource
  resolvers?: IResolvers<any, TContext> | Array<IResolvers<any, TContext>>
  augment?: (schema: GraphQLSchema) => GraphQLSchema
}

export const usePubSub = () => useContext()
  .resolve("pubsub", () => new PubSub({ eventEmitter: useSenses() }))

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

export function useApolloContext(context?: (() => object) | object ): ContextFunction<unknown> {
  const rest = () => typeof context === "function" ? context() : context

  return (session) => ({
    session,
    senses: useSenses(),
    ...rest()
  })
}

export function useDefaultSchema() {
  if (markUsed(useDefaultSchema)) {
    useModule({
      typeDefs,
      resolvers: createResolvers(usePubSub())
    })
  }
}
