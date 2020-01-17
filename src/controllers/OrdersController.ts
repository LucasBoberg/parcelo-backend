import { FastifyInstance } from 'fastify';
import { Controller, FastifyInstanceToken, getInstanceByToken, GET, POST, PUT, DELETE } from 'fastify-decorators';
import * as boom from "@hapi/boom";
import { setIntervalAsync } from 'set-interval-async/dynamic'
import { getManager } from "typeorm";
import { validate } from "class-validator";
import { Order } from "../db/entities/Order";
import { OrderRepository } from "../db/repositories/OrderRepository";
import { UserRepository } from "../db/repositories/UserRepository";
import { ProductRepository } from "../db/repositories/ProductRepository";
import { ShopRepository } from "../db/repositories/ShopRepository";
import { AddressRepository } from "../db/repositories/AddressRepository";
import { convertProduct } from '../Utils/product';
import { convertShop } from '../Utils/shop';
import { convertLocation } from '../Utils/geocoder';

@Controller({ route: "/api/orders" })
export default class OrdersController {
  private static instance = getInstanceByToken<FastifyInstance>(FastifyInstanceToken);

  @GET({ url: "/", options: { schema: { tags: ["order"] }}})
  async getOrders(request, reply) {
    try {
      const orderRepository = await getManager().getCustomRepository(OrderRepository);
      const orders = await orderRepository.find();
      return orders;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @GET({ url: "/shop/:id", options: { schema: { tags: ["order"] }}})
  async getOrdersByShop(request, reply) {
    try {
      const id = request.params.id;
      const orderRepository = await getManager().getCustomRepository(OrderRepository);
      const orders = await orderRepository.findByShopId(id);
      return orders;
    } catch (error) {
      throw boom.boomify(error);
    }
  }
  
  @GET({ url: "/:id", options: { schema: { tags: ["order"] }}})
  async getSingleOrder(request, reply) {
    try {
      const id = request.params.id;
      const orderRepository = await getManager().getCustomRepository(OrderRepository);
      const order = await orderRepository.findOneOrFail(id);
    
      return order;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @POST({ url: "/", options: { preValidation: [OrdersController.instance.authenticate], schema: { 
    tags: ["order"],
    body: {
      type: "object",
      properties: {
        "currency": {
          "type": "string"
        },
        "products": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string"
              },
              "price": {
                "type": "string"
              }
            } 
          }
        },
        "shops": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "address": {
          "type": "array",
          "items": {
            "type": "string"
          }
        }
      }
    }
  }}})
  async addOrder(request, reply) {
    try {
      const orderRepository = await getManager().getCustomRepository(OrderRepository);
      const userRepository = await getManager().getCustomRepository(UserRepository);
      const productRepository = await getManager().getCustomRepository(ProductRepository);
      const shopRepository = await getManager().getCustomRepository(ShopRepository);
      const addressRepository = await getManager().getCustomRepository(AddressRepository);
      const body = await request.body;
      const userPayload = await request.user.payload;
      const user = await userRepository.findOneOrFail(userPayload.id)
      const order = new Order();
      order.user = user;
      order.total = 0;
      order.currency = body.currency;
      order.products = [];
      order.shops = [];
      order.locations = [];
      for (const productData of body.products) {
        const product = await productRepository.findOneOrFail(productData.id);
        const productOrder = await convertProduct(product, Number(productData.price), body.currency);
        order.total = order.total + Number(productData.price);
        order.products.push(productOrder);
      }
      for (const shopId of body.shops) {
        const shop = await shopRepository.findOneOrFail(shopId);
        const shopOrder = await convertShop(shop);
        order.shops.push(shopOrder);
      }
      for (const addressId of body.locations) {
        const address = await addressRepository.findOneOrFail(addressId);
        const locationOrder = await convertLocation(address);
        order.locations.push(locationOrder);
      }
  
      const errors = await validate(order);
      if (errors.length > 0) {
        throw boom.boomify(new Error(errors.toString())); 
      } else {
        await orderRepository.save(order);
      }
      
      return order;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @PUT({ url: "/:id", options: { schema: { tags: ["order"] }}})
  async updateOrder(request, reply) {
    try {
      const id = request.params.id;
      const orderRepository = await getManager().getCustomRepository(OrderRepository);
      const body = request.body;
      const orderData: Order = await orderRepository.findOneOrFail(id);
  
      if (body.currency != null) {
        orderData.currency = body.currency;
      }
  
      if (body.products != null) {
        orderData.products = body.products;
      }

      if (body.shops != null) {
        orderData.shops = body.shops;
      } 

      if (body.locations != null) {
        orderData.locations = body.locations;
      } 

      const errors = await validate(orderData);
      if (errors.length > 0) {
        throw boom.boomify(new Error(errors.toString())); 
      } else {
        await orderRepository.save(orderData);
      }
  
      return orderData;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @DELETE({ url: "/:id", options: { schema: { tags: ["order"] }}})
  async deleteOrder(request, reply) {
    try {
      const id = request.params.id;
      const orderRepository = await getManager().getCustomRepository(OrderRepository);
      const order = await orderRepository.findOneOrFail(id);
      await orderRepository.remove(order);
      return { message: id + " was removed!" };
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @GET({ url: "/realtime", options: { websocket: true, schema: {
    tags: ["order"]
  }}})
  async getRealtimeOrders(connection, request, params) {
    try {
      const orderRepository = await getManager().getCustomRepository(OrderRepository);
      setIntervalAsync(async () => {
        const orders = await orderRepository.find();
        connection.socket.send(JSON.stringify(orders))
      }, 3000)
      
    } catch (error) {
      throw boom.boomify(error);
    }
  }
  @GET({ url: "/shop/realtime/:id", options: { websocket: true, schema: {
    tags: ["order"]
  }}})
  async getRealtimeOrdersByShop(connection, request, params) {
    try {
      const id = await params.id;
      const orderRepository = await getManager().getCustomRepository(OrderRepository);
      setIntervalAsync(async () => {
        const orders = await orderRepository.findByShopId(id);
        connection.socket.send(JSON.stringify(orders))
      }, 3000);
    } catch (error) {
      throw boom.boomify(error);
    }
  }
}