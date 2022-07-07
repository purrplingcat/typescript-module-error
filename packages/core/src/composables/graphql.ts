import { ApolloServer } from "apollo-server";
import typeDefs from "../graphql/schema"
import resolvers from "../graphql/resolvers"
import useLogger from "./logger";
import useSenses from "./senses";

export function useGraphQlServer() {
  const logger = useLogger("graphql-http")
  const senses = useSenses()
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: {
      senses
    }
  })

  server.listen({ port: process.env.HTTP_PORT || 4000 })
    .then((info) => logger.info(`Graphql HTTP server: ${info.url}`))
  
  return server
}
