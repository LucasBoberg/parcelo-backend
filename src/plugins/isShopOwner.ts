import * as fp from "fastify-plugin"
import * as boom from "@hapi/boom";
import { UserRole } from "../Utils/user";

export default fp(async (server, opts, next) => {
  server.decorate("isShopOwner", async (request, reply) => {
    try {
      if (request.user.payload.role === UserRole.SHOPOWNER) {
        return
      } else {
        return reply.code(401).send({
          statusCode: 401,
          error: "Unauthorized",
          message: "You are not a shop owner"
        });
      }
      
    } catch (error) {
      throw boom.boomify(error);
    }
  });

  next();
});