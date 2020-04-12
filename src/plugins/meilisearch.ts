import * as fp from "fastify-plugin"
const MeiliSearch = require('meilisearch');

async function meilisearchClient(server, opts) {
  const client = new MeiliSearch({
    host: opts.host,
    apiKey: opts.apiKey
  });
  server.decorate("search", client);
}

export default fp(meilisearchClient);