import * as boom from "@hapi/boom";
import { getManager } from "typeorm";
import { Product } from "../db/entities/Product";
import { ProductRepository } from "../db/repositories/ProductRepository";
import slugify from "slugify";

export async function getProducts(request, reply) {
  try {
    const productRepository = await getManager().getCustomRepository(ProductRepository);
    const products = await productRepository.find({ relations: ["categories"] });
    return products;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function getSingleProduct(request, reply) {
  try {
    const id = request.params.id;
    const productRepository = await getManager().getCustomRepository(ProductRepository);
    const product = await productRepository.findOne(id, { relations: ["categories", "prices", "reviews"] });
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
    product.width = parseFloat(body.width);
    product.height = parseFloat(body.height);
    product.depth = parseFloat(body.depth);
    product.weight = parseFloat(body.weight);
    product.images = body.images;
    product.alternatives = body.alternatives;
    product.barcode = body.barcode;
    await productRepository.save(product);
    await productRepository.update(product.id, {});
    
    return product;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function updateProduct(request, reply) {
  try {
    const id = request.params.id;
    const productRepository = await getManager().getCustomRepository(ProductRepository);
    const body = request.body;
    const product = new Product();
    product.name = body.name;
    product.slug = slugify(body.name, {lower: true, remove: /[*+~.()'"!:@]/g});
    product.serialNumber = body.serialNumber;
    product.manufacturer = body.manufacturer;
    product.description = body.description;
    product.width = parseFloat(body.width);
    product.height = parseFloat(body.height);
    product.depth = parseFloat(body.depth);
    product.weight = parseFloat(body.weight);
    product.images = body.images;
    product.alternatives = body.alternatives;
    product.barcode = body.barcode;
    await productRepository.update(id, {});
    
    return product;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function deleteProduct(request, reply) {
  try {
    const id = request.params.id;
    const productRepository = await getManager().getCustomRepository(ProductRepository);
    const product = await productRepository.findOne(id);
    await productRepository.remove(product);
    return { message: id + " was removed!" };
  } catch (error) {
    throw boom.boomify(error);
  }
}