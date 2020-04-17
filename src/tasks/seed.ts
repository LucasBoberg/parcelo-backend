import "reflect-metadata";

import { createConnection } from "typeorm";
const MeiliSearch = require("meilisearch");

(async () => {
  console.log("Beginning dbseed task.");

  const conn = await createConnection();
  console.log("PG connected.");

  // Create seed data.
    

  // Close connection
  await conn.close();
  console.log("PG connection closed.");
  console.log("Finished dbseed task.");

  // Set up Meilisearch with index
  const client = new MeiliSearch({
    host: "http://127.0.0.1:7700"
  });

  await client.createIndex({ uid: "products", primaryKey: "id" });

})();