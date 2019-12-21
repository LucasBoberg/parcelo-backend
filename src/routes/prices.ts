import { HTTPMethod } from "fastify";
import { getPrices, getSinglePrice, addPrice, updatePrice, deletePrice } from "../controllers/PricesController";

export const priceRoutes = [
  {
    method: "GET" as HTTPMethod,
    url: '/api/prices',
    handler: getPrices,
    schema: {
      tags: ["price"]
    }
  },
  {
    method: "GET" as HTTPMethod,
    url: '/api/prices/:id',
    handler: getSinglePrice,
    schema: {
      tags: ["price"]
    }
  },
  {
    method: "POST" as HTTPMethod,
    url: '/api/prices',
    handler: addPrice,
    schema: {
      tags: ["price"]
    }
  },
  {
    method: "PUT" as HTTPMethod,
    url: '/api/prices/:id',
    handler: updatePrice,
    schema: {
      tags: ["price"]
    }
  },
  {
    method: "DELETE" as HTTPMethod,
    url: '/api/prices/:id',
    handler: deletePrice,
    schema: {
      tags: ["price"]
    }
  }
];