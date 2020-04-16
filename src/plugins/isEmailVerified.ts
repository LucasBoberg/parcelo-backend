import * as fp from "fastify-plugin"
import * as boom from "@hapi/boom";
import { UserRole } from "../Utils/user";

export default fp(async (server, opts, next) => {
  server.decorate("isAdmin", async (request, reply) => {
    try {
      if (request.user.verifiedEmail === true) {
        return
      } else {
        return reply.code(401).send({
          statusCode: 403,
          error: "Forbidden",
          message: "You need to verify your email"
        });
      }
      
    } catch (error) {
      throw boom.boomify(error);
    }
  });

  next();
});