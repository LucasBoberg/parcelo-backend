import "reflect-metadata";
import { createConnection } from "typeorm";
import { Server, IncomingMessage, ServerResponse } from "http";
import { User } from "./db/entities/User";
import { routes } from "./routes/index";
import { productRoutes } from "./routes/products";
import { swaggerOptions } from "./config/swagger";
import * as fastify from 'fastify';
import * as fastifySwagger from 'fastify-swagger';

const PORT = parseInt(process.env.PORT) || 3000;

const server: fastify.FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify({
    logger: true
});

server.register(fastifySwagger, swaggerOptions)

routes.forEach((route, index) => {
    server.route(route);
});

productRoutes.forEach((route, index) => {
    server.route(route);
});

createConnection().then(async connection => {
    const start = async () => {
        try {
            await server.listen(PORT);
            server.swagger();
            server.log.info(`server listening on ${server.server.address().port}`)
        } catch(error) {
            server.log.error(error);
            process.exit(1);
        }
    }
    start();
}).catch((error) => {
	console.log(error)
});
