import { HTTPMethod } from "fastify";
import { getProducts, getSingleProduct, addProduct, updateProduct, deleteProduct, getSingleProductByBarcode } from "../controllers/ProductsController";

export const productRoutes = [
  {
    method: "GET" as HTTPMethod,
    url: '/api/products',
    handler: getProducts,
    schema: {
      tags: ["product"]
    }
  },
  {
    method: "GET" as HTTPMethod,
    url: '/api/products/:id',
    handler: getSingleProduct,
    schema: {
      tags: ["product"]
    }
  },
  {
    method: "GET" as HTTPMethod,
    url: '/api/products/barcode/:barcode',
    handler: getSingleProductByBarcode,
    schema: {
      tags: ["product"]
    }
  },
  {
    method: "POST" as HTTPMethod,
    url: '/api/products',
    handler: addProduct,
    schema: {
      tags: ["product"]
    }
  },
  {
    method: "PUT" as HTTPMethod,
    url: '/api/products/:id',
    handler: updateProduct,
    schema: {
      tags: ["product"]
    }
  },
  {
    method: "DELETE" as HTTPMethod,
    url: '/api/products/:id',
    handler: deleteProduct,
    schema: {
      tags: ["product"]
    }
  }
];