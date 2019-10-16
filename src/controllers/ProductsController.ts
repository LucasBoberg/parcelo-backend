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
    const productAlternatives = await productRepository.findByIds(product.alternatives, { select: ["id", "slug", "name", "manufacturer", "description", "images"] });
    const completeProduct = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      serialNumber: product.serialNumber,
      manufacturer: product.manufacturer,
      description: product.description,
      width: product.width,
      height: product.height,
      depth: product.depth,
      weight: product.weight,
      images: product.images,
      alternatives: productAlternatives,
      barcode: product.barcode,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }
  
    return completeProduct;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function getSingleProductByBarcode(request, reply) {
  try {
    const barcode = request.params.barcode;
    const productRepository = await getManager().getCustomRepository(ProductRepository);
    const product = await productRepository.findByBarcode(barcode);
  
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
    let updatedValues = {}

    if (body.name != null) {
      updatedValues["name"] = body.name;
      updatedValues["slug"] = slugify(body.name, {lower: true, remove: /[*+~.()'"!:@]/g});;
    }

    if (body.serialNumber != null) {
      updatedValues["serialNumber"] = body.serialNumber;
    } 

    if (body.manufacturer != null) {
      updatedValues["manufacturer"] = body.manufacturer;
    }

    if (body.description != null) {
      updatedValues["description"] = body.description;
    } 

    if (body.width != null) {
      updatedValues["width"] = parseFloat(body.width);
    } 
    if (body.height != null) {
      updatedValues["height"] = parseFloat(body.height);
    } 
    if (body.depth != null) {
      updatedValues["depth"] = parseFloat(body.depth);
    } 
    if (body.weight != null) {
      updatedValues["weight"] = parseFloat(body.weight);
    }

    if (body.images != null) {
      updatedValues["images"] = body.images;
    } 

    if (body.alternatives != null) {
      updatedValues["alternatives"] = body.alternatives;
    } 

    if (body.barcode != null) {
      updatedValues["barcode"] = body.barcode;
    }
    await productRepository.update(id, updatedValues);
    
    return updatedValues;
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