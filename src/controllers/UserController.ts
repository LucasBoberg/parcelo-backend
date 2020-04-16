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
import * as jwt from 'jsonwebtoken';
import { userPayload } from '../Utils/user';

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
        const token = UserController.instance.jwt.sign({ email: user.email, firstName: user.firstName, lastName: user.lastName }, { expiresIn: "2h" });
        const address = "http://localhost:3000/api/users/verifyemail/" + token;
        const info = await UserController.instance.nodemailer.sendMail({
          from: "Parcelo <no-reply@parcelo.se>",
          to: request.body.email,
          subject: "Verify Email",
          text: "Hello " + user.firstName + "," + " verify your email by pressing the link bellow.",
          html: `<a href="${address}">${address}</a>`
        });
  
        return reply.send({
          message: "User signed up successfully, check inbox for verification email",
          user: user,
          messageId: info.messageId
        });
      }
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @POST({ url: "/verifyemail", options: { schema: { 
    tags: ["user"],
    body: {
      "type": "object",
      "properties": {
        "token": {
          "type": "string"
        }
      }
    }
  }}})
  async verifyEmail(request, reply) {
    try {
      const token = request.body.token;
      const userRepository = await getManager().getCustomRepository(UserRepository);

      interface userPayloadMedium {
        email: string,
        firstName: string,
        lastName: string,
        iat: number,
        exp: number
      }

      const decoded: userPayloadMedium = UserController.instance.jwt.verify(token);
      const user = await userRepository.findByEmail(decoded.email);
      
      if (!user.verifiedEmail) {
        await userRepository.update(user.id, { verifiedEmail: true });

        return reply.send({
          message: "User Verified",
        })
      } else {
        return reply.send({
          message: "User is already verified",
        })
      }
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @POST({ url: "/request/verifyemail", options: { schema: { 
    tags: ["user"],
    body: {
      "type": "object",
      "properties": {
        "email": {
          "type": "string"
        }
      }
    }
  }}})
  async requestVerifyEmail(request, reply) {
    try {
      const email = request.body.email;
      const userRepository = await getManager().getCustomRepository(UserRepository);
      const user = await userRepository.findByEmail(email);
      
      if (user) {
        const token = UserController.instance.jwt.sign({ email: user.email, firstName: user.firstName, lastName: user.lastName }, { expiresIn: "2h" });
        const address = "http://localhost:3000/api/users/verifyemail/" + token;
        const info = await UserController.instance.nodemailer.sendMail({
          from: "Parcelo <no-reply@parcelo.se>",
          to: email,
          subject: "Verify Email",
          text: "Hello " + user.firstName + "," + " verify your email by pressing the link bellow.",
          html: `<a href="${address}">${address}</a>`
        });

        return reply.send({
          message: "Check inbox for verification email",
        });
      } else {
        return reply.send({
          message: "Email not in use",
        });
      }
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
          email: user.email,
          verifiedEmail: user.verifiedEmail
        }
        const token = await UserController.instance.jwt.sign(payload, { expiresIn: "15m"});
        const refreshToken = await jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        return reply.code(200).send({
          message: "Auth successful",
          accessToken: token,
          refreshToken: refreshToken
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

  @POST({ url: "/refreshtoken", options: { schema: { 
    tags: ["user"],
    body: {
      "type": "object",
      "properties": {
        "refreshToken": {
          "type": "string"
        }
      }
    }
  }}})
  async generateRefreshToken(request, reply) {
    try {
      const body = request.body;
      const refreshToken = body.refreshToken;

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const decodedPayload = (decoded as userPayload);

      const member = await UserController.instance.redis.sismember(decodedPayload.id, refreshToken);
      console.log(member);
      if (!member) {
        const payload = {
          id: decodedPayload.id,
          role: decodedPayload.role,
          email: decodedPayload.email,
          verifiedEmail: decodedPayload.verifiedEmail
        }
        const newToken = await UserController.instance.jwt.sign(payload, { expiresIn: "15m"});
        const newRefreshToken = await jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
        return reply.code(200).send({
          message: "Auth successful",
          accessToken: newToken,
          refreshToken: newRefreshToken
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


  @DELETE({ url: "/signout", options: { preValidation: [UserController.instance.authenticate], schema: { 
    tags: ["user"],
    body: {
      "type": "object",
      "properties": {
        "refreshToken": {
          "type": "string"
        }
      }
    }
  }}})
  async signOut(request, reply) {
    try {
      const refreshToken = request.body.refreshToken;

      const decoded = jwt.decode(refreshToken);
      const decodedPayload = (decoded as userPayload);

      await UserController.instance.redis.sadd(decodedPayload.id, refreshToken);
      await UserController.instance.redis.expireat(decodedPayload.id, decodedPayload.exp);
      
      return reply.code(200).send({
        message: "Sign out successful"
      });
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @POST({ url: "/resetpassword", options: { schema: { 
    tags: ["user"],
    body: {
      "type": "object",
      "properties": {
        "email": {
          "type": "string"
        }
      }
    }
  }}})
  async sendPasswordResetEmail(request, reply) {
    try {
      const email = request.body.email;
      const userRepository = await getManager().getCustomRepository(UserRepository);
      const user = await userRepository.findByEmail(email);
      
      if (user) {
        const secret = user.password + "-" + user.createdAt;
        const token = jwt.sign({ email: user.email, id: user.id }, secret, { expiresIn: "1h" });
        const address = "http://localhost:3000/api/users/newpassword/" + token;
        const info = await UserController.instance.nodemailer.sendMail({
          from: "Parcelo <no-reply@parcelo.se>",
          to: email,
          subject: "Requested a password reset",
          html: `<a href="${address}">${address}</a>`
        });

        return reply.send({
          message: "Check inbox for reset password email",
        });
      } else {
        return reply.send({
          message: "Email not in use",
        });
      }
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @PUT({ url: "/newpassword", options: { schema: { 
    tags: ["user"],
    body: {
      "type": "object",
      "properties": {
        "token": {
          "type": "string"
        },
        "password": {
          "type": "string"
        }
      }
    }
  }}})
  async newPassword(request, reply) {
    try {
      const token = request.body.token;
      const password = request.body.password
      const userRepository = await getManager().getCustomRepository(UserRepository);

      interface userPayloadSmall {
        email: string,
        id: string
      }

      const payload: userPayloadSmall = UserController.instance.jwt.decode(token);
      const user: User = await userRepository.findOneOrFail(payload.id);
      const secret = user.password + "-" + user.createdAt;
      const decoded = jwt.verify(token, secret);
      const hashedPassword = await bcrypt.hash(password, 10)
      await userRepository.update(user.id, { password: hashedPassword });

      return reply.code(200).send({
        message: "Password was changed"
      });
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
        from: "Parcelo <no-reply@parcelo.se>",
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