import { HTTPMethod } from "fastify";
import { getShops, getSingleShop, addShop, updateShop, deleteShop } from "../controllers/ShopsController";

export const shopRoutes = [
  {
    method: "GET" as HTTPMethod,
    url: '/api/shops',
    handler: getShops,
    schema: {
      tags: ["shop"]
    }
  },
  {
    method: "GET" as HTTPMethod,
    url: '/api/shops/:id',
    handler: getSingleShop,
    schema: {
      tags: ["shop"]
    }
  },
  {
    method: "POST" as HTTPMethod,
    url: '/api/shops',
    handler: addShop,
    schema: {
      tags: ["shop"]
    }
  },
  {
    method: "PUT" as HTTPMethod,
    url: '/api/shops/:id',
    handler: updateShop,
    schema: {
      tags: ["shop"]
    }
  },
  {
    method: "DELETE" as HTTPMethod,
    url: '/api/shops/:id',
    handler: deleteShop,
    schema: {
      tags: ["shop"]
    }
  }
];