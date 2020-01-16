import "reflect-metadata";
import { createConnection } from "typeorm";
import { Server, IncomingMessage, ServerResponse } from "http";
import { bootstrap } from "fastify-decorators";
import * as fastifyWebsocket from "fastify-websocket";
import { join } from "path";
import { swaggerOptions } from "./config/swagger";
import auth from "./plugins/auth";
import schemas from "./plugins/schemas";
import * as fastify from "fastify";
import * as fastifySwagger from "fastify-swagger";
import * as fastifyHelmet from "fastify-helmet";

const PORT = parseInt(process.env.PORT) || 3000;

const server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
  logger: { prettyPrint: true }
});

const bootstrapOptions = {
  directory: join(__dirname, `controllers`),
  mask: /\Controller\./
};

server.register(fastifyHelmet);
server.register(fastifySwagger, swaggerOptions);
server.register(auth);
server.register(schemas);
server.register(fastifyWebsocket);
server.register(bootstrap, bootstrapOptions);

server.get("/test/api/orders/shop/realtime/:id", { websocket: true }, async (connection, req, params) => {
  const id = await params.id;
  console.log(id);
});

createConnection().then(async connection => {
  const start = async () => {
    try {
      await server.listen(PORT);
      server.swagger();
    } catch(error) {
      server.log.error(error);
      process.exit(1);
    }
  }
  start();
}).catch((error) => {
  console.log(error)
});
