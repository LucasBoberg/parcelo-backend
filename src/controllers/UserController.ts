import { FastifyInstance } from 'fastify';
import { Controller, FastifyInstanceToken, getInstanceByToken, GET, POST, PUT, DELETE } from 'fastify-decorators';
import * as boom from "@hapi/boom";
import { getManager } from "typeorm";
import { validate } from "class-validator";
import * as bcrypt from "bcrypt";
import { User } from "../db/entities/User";
import { UserRepository } from "../db/repositories/UserRepository";
import { AddressRepository } from "../db/repositories/AddressRepository";

@Controller({ route: "/api/users" })
export default class UserController {
  private static instance = getInstanceByToken<FastifyInstance>(FastifyInstanceToken);

  @GET({ url: "/", options: { preValidation: [UserController.instance.authenticate], schema: { tags: ["user"] }}})
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

      const errors = await validate(user);
      if (errors.length > 0) {
        throw boom.boomify(new Error(errors.toString())); 
      } else {
        await userRepository.save(user);
      }

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
        const payload = {
          id: user.id,
          role: user.role,
          email: user.email
        }
        const token = await reply.jwtSign({ payload });
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

  @POST({ url: "/:id/addresses", options: { schema: { 
    tags: ["user"],
    body: {
      "type": "object",
      "properties": {
        "addressId": {
          "type": "string"
        }
      }
    }
  }}})
  async addAddressToUser(request, reply) {
    try {
      const id = request.params.id;
      const userRepository = await getManager().getCustomRepository(UserRepository);
      const addressRepository = await getManager().getCustomRepository(AddressRepository);
      const body = request.body;
      const user = await userRepository.findOneOrFail(id, { relations: ["addresses"] });
      const address = await addressRepository.findOneOrFail(body.addressId);

      const addressIds = [];
      for (const addressData of user.addresses) {
        addressIds.push(addressData.id);
      }

      if (!addressIds.includes(address.id)) {
        user.addresses.push(address);
      } else {
        throw boom.boomify(new Error("Address already added")); 
      }
  
      const errors = await validate(user);
      if (errors.length > 0) {
        throw boom.boomify(new Error(errors.toString())); 
      } else {
        await userRepository.save(user);
      }
      
      return user;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @DELETE({ url: "/:id/addresses", options: { schema: { 
    tags: ["user"],
    body: {
      "type": "object",
      "properties": {
        "addressId": {
          "type": "string"
        }
      }
    }
  }}})
  async removeAddressFromUser(request, reply) {
    try {
      const id = request.params.id;
      const userRepository = await getManager().getCustomRepository(UserRepository);
      const addressRepository = await getManager().getCustomRepository(AddressRepository);
      const body = request.body;
      const user = await userRepository.findOneOrFail(id, { relations: ["addresses"] });
      const address = await addressRepository.findOneOrFail(body.addressId);
      const addressIds = [];
      for (const addressData of user.addresses) {
        addressIds.push(addressData.id);
      }

      if (addressIds.includes(address.id)) {
        const index = addressIds.indexOf(address.id, 0);
        user.addresses.splice(index, 1);
      } else {
        throw boom.boomify(new Error("Address is not associated to shop")); 
      }
  
      const errors = await validate(user);
      if (errors.length > 0) {
        throw boom.boomify(new Error(errors.toString())); 
      } else {
        await userRepository.save(user);
      }
      
      return user;
    } catch (error) {
      throw boom.boomify(error);
    }
  }
}