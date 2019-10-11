import * as boom from "@hapi/boom";
import { getManager } from "typeorm";
import { Product } from "../db/entities/Product";
import { ProductRepository } from "../db/repositories/ProductRepository";
import slugify from "slugify";

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
    const product = await productRepository.findOne(id, { relations: ["addresses"] });
    return product;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function addProduct(request, reply) {
  try {
    const productRepository = await getManager().getCustomRepository(ProductRepository);
    const body = request.body;
    const product = new Product();
    product.name = body.name;
    product.slug = slugify(body.name, {lower: true, remove: /[*+~.()'"!:@]/g});
    product.serialNumber = body.serialNumber;
    product.manufacturer = body.manufacturer;
    product.description = body.description;
    product.prices = [];
    product.width = parseFloat(body.width);
    //await productRepository.save(product);
    
    //const product = await productRepository.findOne(id);
    return product;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function deleteProduct(request, reply) {
  try {
    const id = request.params.id;
    const productRepository = await getManager().getCustomRepository(ProductRepository);
    const product = await productRepository.findOne(id, { relations: ["addresses"] });
    await productRepository.remove(product);
    return product;
  } catch (error) {
    throw boom.boomify(error);
  }
}