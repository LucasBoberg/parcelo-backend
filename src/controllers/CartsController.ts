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
      const cart = await cartRepository.findOneOrFail(id, { relations: ["products", "products.prices", "products.prices.shop", "user"] });

      const smallProducts = [];
      

      cart.products.forEach((product) => {
        let completePrices = [];
        if (product.prices.length > 0 && product.prices[0].price !== null) {
          product.prices.forEach((priceInformation) => {
            const priceObject = {
              price: priceInformation.price,
              currency: priceInformation.currency,
              shop: {
                id: priceInformation.shop.id,
                slug: priceInformation.shop.slug,
                name: priceInformation.shop.name,
                description: priceInformation.shop.description,
                type: priceInformation.shop.type,
                logo: priceInformation.shop.logo
              },
              createdAt: priceInformation.createdAt,
              updatedAt: priceInformation.updatedAt
            }
            completePrices.push(priceObject)
          });
        }

        const smallProduct = {
          id: product.id,
          slug: product.slug,
          name: product.name,
          manufacturer: product.manufacturer,
          description: product.description,
          image: product.images[0],
          prices: completePrices
        }
        smallProducts.push(smallProduct);
      });

      const smallCart = {
        id: cart.id,
        total: cart.total,
        currency: cart.currency,
        products: smallProducts,
        userId: cart.user.id
      }
    
      return smallCart;
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
      cart.products = [];

      if (body.products !== undefined || body.products !== null) {
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

        if (cartData.products === null || cartData.products === undefined) {
          cartData.products = [];
        }
  
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

  @POST({ url: "/:id/add", options: { schema: {
    tags: ["cart"],
    body: {
      "type": "object",
      "properties": {
        "productId": {
          "type": "string"
        }
      }
    }
  }}})
  async addProduct(request, reply) {
    try {
      const id = request.params.id;
      const productId = request.body.productId;
      const cartRepository = await getManager().getCustomRepository(CartRepository);
      const productRepository = await getManager().getCustomRepository(ProductRepository);
      const cart = await cartRepository.findOneOrFail(id, { relations: ["products"] });
      const product = await productRepository.findOneOrFail(productId);
      if (cart.products === null || cart.products === undefined) {
        cart.products = [];
      }

      const added = cart.products.findIndex(({ id }) => id === productId);

      if (added === -1) {
        cart.products.push(product);
      } else {
        throw boom.boomify(new Error("Product already added to cart"));
      }

      const errors = await validate(cart);
      if (errors.length > 0) {
        throw boom.boomify(new Error(errors.toString())); 
      } else {
        await cartRepository.save(cart);
      }

      return { message: product.name + " was added!" }
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @DELETE({ url: "/:id/remove", options: { schema: { 
    tags: ["cart"],
    body: {
      "type": "object",
      "properties": {
        "productId": {
          "type": "string"
        }
      }
    } 
  }}})
  async removeProduct(request, reply) {
    try {
      const id = request.params.id;
      const productId = request.body.productId;
      const cartRepository = await getManager().getCustomRepository(CartRepository);
      const productRepository = await getManager().getCustomRepository(ProductRepository);
      const cart = await cartRepository.findOneOrFail(id, { relations: ["products"] });
      const product = await productRepository.findOneOrFail(productId);

      if (cart.products === null || cart.products === undefined) {
        cart.products = [];
      }

      const added = cart.products.findIndex(({ id }) => id === productId);

      if (added > -1) {
        const index = cart.products.indexOf(product, 0);
        cart.products.splice(index, 1);
      } else {
        throw boom.boomify(new Error("Product is not in cart"));
      }
      
      const errors = await validate(cart);
      if (errors.length > 0) {
        throw boom.boomify(new Error(errors.toString())); 
      } else {
        await cartRepository.save(cart);
      }
      return { message: product.name + " was removed!" }
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