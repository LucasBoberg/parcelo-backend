import * as fastify from "fastify";
import * as http from "http";
import Meili from "meilisearch";

declare module "fastify" {
  export interface FastifyInstance<
    HttpServer = http.Server,
    HttpRequest = http.IncomingMessage,
    HttpResponse = http.ServerResponse
  > {
    authenticate(): void;
    isAdmin(): void;
    search: Meili;
  }
  
}