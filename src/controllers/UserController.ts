import { Controller, AbstractController, GET, POST, PUT, DELETE } from 'fastify-decorators';
import * as boom from "@hapi/boom";
import { getManager } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../db/entities/User";
import { UserRepository } from "../db/repositories/UserRepository";

@Controller({ route: "/api/users" })
export default class UserController extends AbstractController {

  @GET({ url: "/", options: { schema: { tags: ["user"] }}})
  async getUsers(request, reply) {
    try {
      const userRepository = await getManager().getCustomRepository(UserRepository);
      const users = await userRepository.find();
      return users;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @GET({ url: "/:id", options: { schema: { tags: ["user"] }}})
  async getSingleUser(request, reply) {
    try {
      const id = request.params.id;
      const userRepository = await getManager().getCustomRepository(UserRepository);
      const user = await userRepository.findOneOrFail(id, { relations: ["addresses"] });
      return user;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @POST({ url: "/signup", options: { schema: { tags: ["user"] }}})
  async signUp(request, reply) {
    try {
      const body = request.body;
      const userRepository = await getManager().getCustomRepository(UserRepository);
  
      const hashedPassword = await bcrypt.hash(body.password, 10)
  
      const user = new User();
      user.firstName = body.firstName;
      user.lastName = body.lastName;
      user.email = body.email;
      user.password = hashedPassword;
      user.addresses = [];
      await userRepository.save(user);
      return user;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @POST({ url: "/signin", options: { schema: { tags: ["user"] }}})
  async signIn(request, reply) {
    try {
      const body = request.body;
      const email = body.email;
      const userRepository = await getManager().getCustomRepository(UserRepository);
  
      const user: User = await userRepository.findByEmail(email);
  
      const match = await bcrypt.compare(body.password, user.password);
  
      if (match) {
        const token = await reply.jwtSign({ user });
        return reply.code(200).send({
          message: "Auth successful",
          token: token
        });
      } else {
        return reply.code(401).send({
          message: "Auth failed"
        });
      }
    } catch (error) {
      throw boom.boomify(error);
    }
  }
}