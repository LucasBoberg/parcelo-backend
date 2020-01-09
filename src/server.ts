import "reflect-metadata";
import { createConnection } from "typeorm";
import { Server, IncomingMessage, ServerResponse } from "http";
import { bootstrap } from 'fastify-decorators';
import { join } from 'path';
import { swaggerOptions } from "./config/swagger";
import auth from "./plugins/auth";
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
server.register(bootstrap, bootstrapOptions);

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
