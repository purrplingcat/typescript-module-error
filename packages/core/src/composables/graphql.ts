import { ApolloServer, GraphQLSchemaModule } from "apollo-server";
import typeDefs from "../graphql/schema"
import resolvers from "../graphql/resolvers"
import useLogger from "./logger";
import useSenses from "./senses";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { IResolvers, TypeSource } from "@graphql-tools/utils";
import { flatten, isDefined } from "../utils";
import { GraphQLSchema } from "graphql";

const modules: GraphQlModule<any>[] = [{ typeDefs, resolvers }]
const schemaExtensions: ((schema: GraphQLSchema) => GraphQLSchema)[] = []

export type GraphQlModule<TContext> = {
  typeDefs: TypeSource;
  resolvers?: IResolvers<any, TContext> | Array<IResolvers<any, TContext>>;
}

export function useModule<TContext>(module: GraphQlModule<TContext>) {
  if (!modules.includes(module)) {
    modules.push(module)
  }
}

export function withSchema(ext: (schema: GraphQLSchema) => GraphQLSchema) {
  if (!schemaExtensions.includes(ext)) {
    schemaExtensions.push(ext)
  }
}

export function startGraphQlServer() {
  const logger = useLogger("graphql-http")
  const schema = makeExecutableSchema({ 
    typeDefs: flatten(modules.map(m => m.typeDefs)),
    resolvers: flatten(modules.map(m => m.resolvers).filter(isDefined)),
  })
  const server = new ApolloServer({
    schema: schemaExtensions.reduce((s, ext) => ext(s), schema),
    context: () => ({
      senses: useSenses()
    })
  })

  logger.debug(`Using ${modules.length} GraphQL modules and ${schemaExtensions.length} schema extensions`)
  server.listen({ port: process.env.HTTP_PORT || 4000 })
    .then(({ url }) => logger.info(`Graphql HTTP server: ${url}`))
  
  return server
}
