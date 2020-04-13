import * as fastify from "fastify";
import * as http from "http";
import Meili from "meilisearch";
import { Transporter } from "nodemailer";
import * as jwt from 'jsonwebtoken';

declare module "fastify" {
  namespace JWTTypes {
    type SignPayloadType = object | string | Buffer;
    type VerifyPayloadType = object | string;
    type DecodePayloadType = object | string;

    interface SignCallback extends jwt.SignCallback {}

    interface VerifyCallback<Decoded extends VerifyPayloadType> extends jwt.VerifyCallback {
      (err: jwt.VerifyErrors, decoded: Decoded): void;
    }
  }

  interface JWT {
    options: {
      decode: jwt.DecodeOptions;
      sign: jwt.SignOptions;
      verify: jwt.VerifyOptions;
    };
    secret: jwt.Secret;
  
    sign(payload: JWTTypes.SignPayloadType, options?: jwt.SignOptions): string;
    sign(payload: JWTTypes.SignPayloadType, callback: JWTTypes.SignCallback): void;
    sign(payload: JWTTypes.SignPayloadType, options: jwt.SignOptions, callback: JWTTypes.SignCallback): void;
  
    verify<Decoded extends JWTTypes.VerifyPayloadType>(token: string, options?: jwt.VerifyOptions): Decoded;
    verify<Decoded extends JWTTypes.VerifyPayloadType>(token: string, callback: JWTTypes.VerifyCallback<Decoded>): void;
    verify<Decoded extends JWTTypes.VerifyPayloadType>(
      token: string,
      options: jwt.VerifyOptions,
      callback: JWTTypes.VerifyCallback<Decoded>,
    ): void;
  
    decode<Decoded extends JWTTypes.DecodePayloadType>(token: string, options?: jwt.DecodeOptions): null | Decoded;
  }

  export interface FastifyInstance<
    HttpServer = http.Server,
    HttpRequest = http.IncomingMessage,
    HttpResponse = http.ServerResponse
  > {
    authenticate(): void;
    isAdmin(): void;
    search: Meili;
    nodemailer: Transporter;
    jwt: JWT;
  }
  
}