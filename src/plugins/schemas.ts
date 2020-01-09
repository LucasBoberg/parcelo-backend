import * as fp from "fastify-plugin"

export default fp((server, opts, next) => {
  server.addSchema({
    $id: '#category',
    "type": "object",
    "properties": {
      "name": {
        "type": "string"
      },
      "description": {
        "type": "string"
      }
    }
  });
  next();
});