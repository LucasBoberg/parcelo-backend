import * as fp from "fastify-plugin"
import * as boom from "@hapi/boom";
import { UserRole } from "../Utils/user";

export default fp(async (server, opts, next) => {
  server.decorate("isAdmin", async (request, reply) => {
    try {
      if (request.user.payload === UserRole.ADMIN) {
        return
      } else {
        reply.code(401).send({
          statusCode: 401,
          error: "Unauthorized",
          message: "You are not an admin"
        })
      }
      
    } catch (error) {
      throw boom.boomify(error);
    }
  });

  next();
});