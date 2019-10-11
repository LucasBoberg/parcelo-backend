import { HTTPMethod } from "fastify";
import { getProducts, getSingleProduct, addProduct } from "../controllers/ProductsController";

export const productRoutes = [
  {
    method: "GET" as HTTPMethod,
    url: '/api/products',
    handler: getProducts
  },
  {
    method: "GET" as HTTPMethod,
    url: '/api/products/:id',
    handler: getSingleProduct
  },
  {
    method: "POST" as HTTPMethod,
    url: '/api/products',
    handler: addProduct
  }
];