import express from "express"
import http from "http"
import { ApolloServer } from "apollo-server-express"
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { useSenses, useLogger, createSchema } from "@senses/core"
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";

const logger = useLogger("graphql-http")

function createWsServer(httpServer: http.Server) {
  return new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: '/graphql',
  });
}

export async function startApolloServer(app: express.Application, httpServer: http.Server) {
  const port = process.env.HTTP_PORT || 4000
  const schema = createSchema()
  const wsServer = createWsServer(httpServer)
  const serverCleanup = useServer({ schema }, wsServer);
  const server = new ApolloServer({
    schema,
    csrfPrevention: true,
    cache: "bounded",
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
    context: (session) => ({
      senses: useSenses(),
      session,
    })
  })

  await server.start()
  server.applyMiddleware({ app })
  await new Promise<void>(resolve => httpServer.listen({ port }, resolve));
  logger.info(`Graphql HTTP server: http://localhost:${port}${server.graphqlPath}`)
}
