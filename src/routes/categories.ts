import { HTTPMethod } from "fastify";
import { getCategories, getSingleCategory, addCategory, updateCategory, deleteCategory } from "../controllers/CategoriesController";

export const categoryRoutes = [
  {
    method: "GET" as HTTPMethod,
    url: '/api/categories',
    handler: getCategories,
    schema: {
      tags: ["category"]
    }
  },
  {
    method: "GET" as HTTPMethod,
    url: '/api/categories/:slug',
    handler: getSingleCategory,
    schema: {
      tags: ["category"]
    }
  },
  {
    method: "POST" as HTTPMethod,
    url: '/api/categories',
    handler: addCategory,
    schema: {
      tags: ["category"]
    }
  },
  {
    method: "PUT" as HTTPMethod,
    url: '/api/categories/:slug',
    handler: updateCategory,
    schema: {
      tags: ["category"]
    }
  },
  {
    method: "DELETE" as HTTPMethod,
    url: '/api/categories/:slug',
    handler: deleteCategory,
    schema: {
      tags: ["category"]
    }
  }
];