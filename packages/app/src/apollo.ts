import express from "express"
import http from "http"
import { ApolloServer } from "apollo-server-express"
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import { useSenses, useLogger, createSchema } from "@senses/core"

const logger = useLogger("graphql-http")

export async function startApolloServer(app: express.Application) {
  const port = process.env.HTTP_PORT || 4000
  const httpServer = http.createServer(app)
  const server = new ApolloServer({
    schema: createSchema(),
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    context: (session) => ({
      senses: useSenses(),
      session
    })
  })

  await server.start()
  server.applyMiddleware({ app })
  await new Promise<void>(resolve => httpServer.listen({ port }, resolve));
  logger.info(`Graphql HTTP server: http://localhost:${port}${server.graphqlPath}`)
}
