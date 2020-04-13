import { FastifyInstance } from 'fastify';
import { Controller, FastifyInstanceToken, getInstanceByToken, GET, POST, PUT, DELETE } from 'fastify-decorators';
import * as boom from "@hapi/boom";
import { getManager } from "typeorm";
import { validate } from "class-validator";
import * as bcrypt from "bcrypt";
import { User } from "../db/entities/User";
import { UserRepository } from "../db/repositories/UserRepository";
import { AddressRepository } from "../db/repositories/AddressRepository";
import { ProductRepository } from '../db/repositories/ProductRepository';

@Controller({ route: "/api/users" })
export default class UserController {
  private static instance = getInstanceByToken<FastifyInstance>(FastifyInstanceToken);

  @GET({ url: "/", options: { preValidation: [UserController.instance.authenticate, UserController.instance.isAdmin], schema: { tags: ["user"] }}})
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

  @POST({ url: "/signup", options: { schema: { 
    tags: ["user"],
    body: {
      "type": "object",
      "properties": {
        "firstName": {
          "type": "string"
        },
        "lastName": {
          "type": "string"
        },
        "email": {
          "type": "string"
        },
        "password": {
          "type": "string"
        }
      }
    }
  }}})
  async signUp(request, reply) {
    try {
      const body = request.body;
      const userRepository = await getManager().getCustomRepository(UserRepository);
  
      const hashedPassword = await bcrypt.hash(body.password, 10);
  
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

  @POST({ url: "/signin", options: { schema: { 
    tags: ["user"],
    body: {
      "type": "object",
      "properties": {
        "email": {
          "type": "string"
        },
        "password": {
          "type": "string"
        }
      }
    }
  }}})
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

  @PUT({ url: "/changepassword", options: { preValidation: [UserController.instance.authenticate], schema: { 
    tags: ["user"],
    body: {
      "type": "object",
      "properties": {
        "currentPassword": {
          "type": "string"
        },
        "newPassword": {
          "type": "string"
        }
      }
    }
  }}})
  async changePassword(request, reply) {
    try {
      const body = request.body;
      const userRepository = await getManager().getCustomRepository(UserRepository);
  
      const user: User = await userRepository.findOneOrFail(request.user.payload.id);
  
      const match = await bcrypt.compare(body.currentPassword, user.password);
  
      if (match) {
        const hashedPassword = await bcrypt.hash(body.newPassword, 10)
        await userRepository.update(user.id, { password: hashedPassword });

        return reply.code(200).send({
          message: "Password was changed"
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

  @POST({ url: "/send" })
  async sendEmail(request, reply) {
    try {

      const info = await UserController.instance.nodemailer.sendMail({
        from: "Parcelo <info@parcelo.se>",
        to: request.body.email,
        subject: "Test Mail",
        text: "Hello " + request.body.email + "!"
      });

      return reply.send({
        message: "Email sent successfully",
        messageId: info.messageId
      })
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
  
  @GET({ url: "/:id/favorites", options: { schema: { tags: ["user"] }}})
  async getFavorites(request, reply) {
    try {
      const id = request.params.id;
      const userRepository = await getManager().getCustomRepository(UserRepository);
      const productRepository = await getManager().getCustomRepository(ProductRepository);
      const user = await userRepository.findOneOrFail(id);

      const products = await productRepository.findByIds(user.favorites);

      const smallProducts = [];

      products.forEach((product) => {
        const smallProduct = {
          id: product.id,
          slug: product.slug,
          name: product.name,
          manufacturer: product.manufacturer,
          description: product.description,
          color: product.color,
          image: product.images[0],
          categories: product.categories,
          prices: product.prices,
          reviews: product.reviews,
          barcode: product.barcode,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
        smallProducts.push(smallProduct);
      });

      return smallProducts;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @POST({ url: "/:id/favorites", options: { schema: { 
    tags: ["user"],
    body: {
      "type": "object",
      "properties": {
        "productId": {
          "type": "string"
        }
      }
    }
  }}})
  async addFavoriteToUser(request, reply) {
    try {
      const id = request.params.id;
      const userRepository = await getManager().getCustomRepository(UserRepository);
      const body = request.body;
      const user = await userRepository.findOneOrFail(id);

      if (!user.favorites.includes(body.productId)) {
        user.favorites.push(body.productId);
      } else {
        throw boom.boomify(new Error("Product is already favorited")); 
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

  @DELETE({ url: "/:id/favorites", options: { schema: { 
    tags: ["user"],
    body: {
      "type": "object",
      "properties": {
        "productId": {
          "type": "string"
        }
      }
    }
  }}})
  async removeFavoriteFromUser(request, reply) {
    try {
      const id = request.params.id;
      const userRepository = await getManager().getCustomRepository(UserRepository);
      const body = request.body;
      const user = await userRepository.findOneOrFail(id);

      if (user.favorites.includes(body.productId)) {
        const index = user.favorites.findIndex(id => id === body.productId);
        user.favorites.splice(index, 1);
      } else {
        throw boom.boomify(new Error("Product is not favorited")); 
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

  @GET({ url: "/:id/recents", options: { schema: { tags: ["user"] }}})
  async getRecents(request, reply) {
    try {
      const id = request.params.id;
      const userRepository = await getManager().getCustomRepository(UserRepository);
      const productRepository = await getManager().getCustomRepository(ProductRepository);
      const user = await userRepository.findOneOrFail(id);

      const products = await productRepository.findByIds(user.recents);

      const smallProducts = [];

      products.forEach((product) => {
        const smallProduct = {
          id: product.id,
          slug: product.slug,
          name: product.name,
          manufacturer: product.manufacturer,
          description: product.description,
          color: product.color,
          image: product.images[0],
          categories: product.categories,
          prices: product.prices,
          reviews: product.reviews,
          barcode: product.barcode,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
        smallProducts.push(smallProduct);
      });

      return smallProducts;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @POST({ url: "/:id/recents", options: { schema: { 
    tags: ["user"],
    body: {
      "type": "object",
      "properties": {
        "productId": {
          "type": "string"
        }
      }
    }
  }}})
  async addRecentToUser(request, reply) {
    try {
      const id = request.params.id;
      const userRepository = await getManager().getCustomRepository(UserRepository);
      const body = request.body;
      const user = await userRepository.findOneOrFail(id);

      if (!user.recents.includes(body.productId)) {
        user.recents.push(body.productId);
      } else {
        throw boom.boomify(new Error("Product is already in recents")); 
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

  @DELETE({ url: "/:id/recents", options: { schema: { 
    tags: ["user"],
    body: {
      "type": "object",
      "properties": {
        "productId": {
          "type": "string"
        }
      }
    }
  }}})
  async removeRecentFromUser(request, reply) {
    try {
      const id = request.params.id;
      const userRepository = await getManager().getCustomRepository(UserRepository);
      const body = request.body;
      const user = await userRepository.findOneOrFail(id);

      if (user.recents.includes(body.productId)) {
        const index = user.recents.findIndex(id => id === body.productId);
        user.recents.splice(index, 1);
      } else {
        throw boom.boomify(new Error("Product is not in recents")); 
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