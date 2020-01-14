import { Controller, GET, POST, PUT, DELETE } from 'fastify-decorators';
import * as boom from "@hapi/boom";
import { getManager } from "typeorm";
import { validate } from "class-validator";
import { Price } from "../db/entities/Price";
import { PriceRepository } from "../db/repositories/PriceRepository";
import { ShopRepository } from "../db/repositories/ShopRepository";
import { ProductRepository } from "../db/repositories/ProductRepository";

@Controller({ route: "/api/prices" })
export default class PricesController {
  @GET({ url: "/", options: { schema: { tags: ["price"] }}})
  async getPrices(request, reply) {
    try {
      const priceRepository = await getManager().getCustomRepository(PriceRepository);
      const prices = await priceRepository.find({ relations: ["product", "shop"] });
      return prices;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @GET({ url: "/:id", options: { schema: { tags: ["price"] }}})
  async getSinglePrice(request, reply) {
    try {
      const id = request.params.id;
      const priceRepository = await getManager().getCustomRepository(PriceRepository);
      const price = await priceRepository.findOneOrFail(id, { relations: ["product", "shop"] });
    
      return price;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @POST({ url: "/", options: { schema: { 
    tags: ["price"],
    body: {
      "type": "object",
      "properties": {
        "price": {
          "type": "string"
        },
        "currency": {
          "type": "string"
        },
        "shopId": {
          "type": "string"
        },
        "productId": {
          "type": "string"
        }
      }
    }
  }}})
  async addPrice(request, reply) {
    try {
      const priceRepository = await getManager().getCustomRepository(PriceRepository);
      const shopRepository = await getManager().getCustomRepository(ShopRepository);
      const productRepository = await getManager().getCustomRepository(ProductRepository);
      const body = request.body;
  
      const shop = await shopRepository.findOneOrFail(body.shopId);
      const product = await productRepository.findOneOrFail(body.productId);
  
      const price = new Price();
      price.price = body.price;
      price.currency = body.currency;
      price.shop = shop;
      price.product = product;
  
      const errors = await validate(price);
      if (errors.length > 0) {
        throw boom.boomify(new Error(errors.toString())); 
      } else {
        await priceRepository.save(price);
      }
      
      return price;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @PUT({ url: "/:id", options: { schema: { tags: ["price"] }}})
  async updatePrice(request, reply) {
    try {
      const id = request.params.id;
      const priceRepository = await getManager().getCustomRepository(PriceRepository);
      const shopRepository = await getManager().getCustomRepository(ShopRepository);
      const productRepository = await getManager().getCustomRepository(ProductRepository);
      const body = request.body;
      const priceData: Price = await priceRepository.findOneOrFail(id);
  
      if (body.price != null) {
        priceData.price = body.price;
      }
      if (body.currency != null) {
        priceData.currency = body.currency;
      }
      if (body.shopId != null) {
        const shop = await shopRepository.findOneOrFail(body.shopId);
        priceData.shop = shop;
      }
      if (body.productId != null) {
        const product = await productRepository.findOneOrFail(body.productId);
        priceData.product = product;
      }
  
      const errors = await validate(priceData);
      if (errors.length > 0) {
        throw boom.boomify(new Error(errors.toString())); 
      } else {
        await priceRepository.save(priceData);
      }
  
      return priceData;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @DELETE({ url: "/:id", options: { schema: { tags: ["price"] }}})
  async deletePrice(request, reply) {
    try {
      const id = request.params.id;
      const priceRepository = await getManager().getCustomRepository(PriceRepository);
      const category = await priceRepository.findOneOrFail(id);
      await priceRepository.remove(category);
      return { message: id + " was removed!" };
    } catch (error) {
      throw boom.boomify(error);
    }
  }
}