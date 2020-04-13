import * as fp from "fastify-plugin"
import * as boom from "@hapi/boom";
import { UserRole } from "../Utils/user";

export default fp(async (server, opts, next) => {
  server.decorate("isDeliverer", async (request, reply) => {
    try {
      if (request.user.payload.role === UserRole.DELIVERER) {
        return
      } else {
        return reply.code(401).send({
          statusCode: 403,
          error: "Forbidden",
          message: "You are not a deliverer"
        });
      }
      
    } catch (error) {
      throw boom.boomify(error);
    }
  });

  next();
});