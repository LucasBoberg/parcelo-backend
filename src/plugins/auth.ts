import * as fp from "fastify-plugin"
import * as boom from "@hapi/boom";

export default fp(async (server, opts) => {
  server.register(require("fastify-jwt"), {
    secret: "randomSecretCodeStuff",
    sign: {
      expiresIn: "2d"
    }
  });
  server.decorate("authenticate", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      throw boom.boomify(error);
    }
  });
});