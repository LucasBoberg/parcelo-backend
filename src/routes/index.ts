import { HTTPMethod } from "fastify";
import { getUsers, getSingleUser, signUp } from "../controllers/UserController";

export const routes = [
  {
    method: "GET" as HTTPMethod,
    url: '/api/users',
    handler: getUsers,
    schema: {
      tags: ["user"]
    }
  },
  {
    method: "GET" as HTTPMethod,
    url: '/api/users/:id',
    handler: getSingleUser,
    schema: {
      tags: ["user"]
    }
  },
  {
    method: "POST" as HTTPMethod,
    url: '/api/users',
    handler: signUp,
    schema: {
      tags: ["user"]
    }
  }
];