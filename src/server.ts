import "reflect-metadata";
import * as path from "path";
import { createConnection } from "typeorm";
import { Server, IncomingMessage, ServerResponse } from "http";
import { bootstrap } from "fastify-decorators";
import * as fastifyWebsocket from "fastify-websocket";
import { join } from "path";
import { swaggerOptions } from "./config/swagger";
import auth from "./plugins/auth";
import search from "./plugins/meilisearch";
import isAdmin from "./plugins/isAdmin";
import isShopOwner from "./plugins/isShopOwner";
import isDeliverer from "./plugins/isDeliverer";
import schemas from "./plugins/schemas";
import * as fastify from "fastify";
import * as fastifySwagger from "fastify-swagger";
import * as fastifyNodemailer from "fastify-nodemailer";
import * as fastifyHelmet from "fastify-helmet";
import fastifyMulter from "fastify-multer";
import * as fastifyStatic from "fastify-static";

const PORT = parseInt(process.env.PORT) || 3000;

const server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
  logger: { prettyPrint: true }
});

const bootstrapOptions = {
  directory: join(__dirname, `controllers`),
  mask: /\Controller\./
};

server.register(auth);
server.register(isAdmin);
server.register(isShopOwner);
server.register(isDeliverer);
server.register(search, {
  host: "http://127.0.0.1:7700"
});
server.register(fastifyNodemailer, {
  host: "ns3.inleed.net",
  port: 465,
  secure: true,
  auth: {
    user: "no-reply@parcelo.se",
    pass: "AagC3SNz1ioom1P8"
  }
});
server.register(fastifyHelmet);
server.register(fastifyStatic, {
  root: path.join(__dirname, "..", "uploads"),
  prefix: "/uploads/"
});
server.register(fastifySwagger, swaggerOptions);
server.register(schemas);
server.register(fastifyWebsocket);
server.register(fastifyMulter.contentParser);
server.register(bootstrap, bootstrapOptions);

createConnection().then(async connection => {
  const start = async () => {
    try {
      await server.listen(PORT, "0.0.0.0");
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
