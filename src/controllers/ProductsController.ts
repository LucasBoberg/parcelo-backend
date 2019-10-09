import * as boom from "@hapi/boom";
import { getManager } from "typeorm";
import { Product } from "../db/entities/Product";
import { ProductRepository } from "../db/repositories/ProductRepository";

export async function getProducts(request, reply) {
  try {
    const productRepository = await getManager().getCustomRepository(ProductRepository);
    const products = await productRepository.find();
    return products;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function getSingleProduct(request, reply) {
  try {
    const id = request.params.id;
    const productRepository = await getManager().getCustomRepository(ProductRepository);
    const products = await productRepository.findOne(id);
    return products;
  } catch (error) {
    throw boom.boomify(error);
  }
}