import { Controller, GET, POST, PUT, DELETE } from 'fastify-decorators';
import * as boom from "@hapi/boom";
import { getManager } from "typeorm";
import { validate } from "class-validator";
import { CartRepository } from "../db/repositories/CartRepository";
import { UserRepository } from "../db/repositories/UserRepository";
import { ProductRepository } from "../db/repositories/ProductRepository";
import { Cart } from '../db/entities/Cart';
import { Product } from '../db/entities/Product';

@Controller({ route: "/api/carts" })
export default class CartsController {
  @GET({ url: "/:id", options: { schema: { tags: ["cart"] }}})
  async getSingleCart(request, reply) {
    try {
      const id = request.params.id;
      const cartRepository = await getManager().getCustomRepository(CartRepository);
      const cart = await cartRepository.findOneOrFail(id, { relations: ["products", "user"] });
    
      return cart;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @POST({ url: "/", options: { schema: { 
    tags: ["cart"],
    body: {
      type: "object",
      properties: {
        "currency": {
          "type": "string"
        },
        "userId": {
          "type": "string"
        },
        "products": {
          "type": "array",
          "optional": false,
          "items": {
            "type": "string"
          }
        }
      }
    }
  }}})
  async addCart(request, reply) {
    try {
      const cartRepository = await getManager().getCustomRepository(CartRepository);
      const body = request.body;
      const userId = body.userId;
      const userRepository = await getManager().getCustomRepository(UserRepository);

      const user = await userRepository.findOneOrFail(userId);
  
      const cart = new Cart();
      cart.currency = body.currency;
      cart.user = user;

      if (body.products != undefined || body.products != null) {
        const productRepository = await getManager().getCustomRepository(ProductRepository);
  
        for (const productId of body.products) {
          const product = await productRepository.findOneOrFail(productId)
          cart.products.push(product);
        }
      }
  
      const errors = await validate(cart);
      if (errors.length > 0) {
        throw boom.boomify(new Error(errors.toString())); 
      } else {
        await cartRepository.save(cart);
      }
      
      return cart;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @PUT({ url: "/:id", options: { schema: { tags: ["cart"] }}})
  async updateCart(request, reply) {
    try {
      const id = request.params.id;
      const cartRepository = await getManager().getCustomRepository(CartRepository);
      const body = request.body;
      const cartData: Cart = await cartRepository.findOneOrFail(id);
  
      if (body.total != null) {
        cartData.total = body.total;
      }
  
      if (body.currency != null) {
        cartData.currency = body.currency;
      }

      if (body.currency != null) {
        cartData.currency = body.currency;
      }

      if (body.products != undefined || body.products != null) {
        const productRepository = await getManager().getCustomRepository(ProductRepository);
  
        for (const productId of body.products) {
          const product = await productRepository.findOneOrFail(productId)
          cartData.products.push(product);
        }
      }

      const errors = await validate(cartData);
      if (errors.length > 0) {
        throw boom.boomify(new Error(errors.toString())); 
      } else {
        await cartRepository.save(cartData);
      }
  
      return cartData;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @DELETE({ url: "/:id", options: { schema: { tags: ["cart"] }}})
  async deleteCart(request, reply) {
    try {
      const id = request.params.id;
      const cartRepository = await getManager().getCustomRepository(CartRepository);
      const cart = await cartRepository.findOneOrFail(id);
      await cartRepository.remove(cart);
      return { message: id + " was removed!" };
    } catch (error) {
      throw boom.boomify(error);
    }
  }
}