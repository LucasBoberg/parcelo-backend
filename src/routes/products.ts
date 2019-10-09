import { HTTPMethod } from "fastify";
import { getProducts } from "../controllers/ProductsController";

export const productRoutes = [
  {
    method: "GET" as HTTPMethod,
    url: '/api/products',
    handler: getProducts
  },
  {
    method: "GET" as HTTPMethod,
    url: '/api/',
    handler: getProducts
  }
];