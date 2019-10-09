import { HTTPMethod } from "fastify";
import { getUsers, signUp } from "../controllers/UserController";

export const routes = [
  {
    method: "GET" as HTTPMethod,
    url: '/api/users',
    handler: getUsers
  },
  {
    method: "GET" as HTTPMethod,
    url: '/api/users/:id',
    handler: getUsers
  }
];