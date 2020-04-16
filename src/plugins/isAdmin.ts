import * as fp from "fastify-plugin"
import * as boom from "@hapi/boom";
import { UserRole } from "../Utils/user";

export default fp(async (server, opts, next) => {
  server.decorate("isAdmin", async (request, reply) => {
    try {
      console.log(request.user);
      if (request.user.role === UserRole.ADMIN) {
        return
      } else {
        return reply.code(401).send({
          statusCode: 403,
          error: "Forbidden",
          message: "You are not an admin"
        });
      }
      
    } catch (error) {
      throw boom.boomify(error);
    }
  });

  next();
});