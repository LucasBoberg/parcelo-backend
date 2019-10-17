import * as boom from "@hapi/boom";
import { getManager } from "typeorm";
import { validate } from "class-validator";
import { Product } from "../db/entities/Product";
import { Category } from "../db/entities/Category";
import { ProductRepository } from "../db/repositories/ProductRepository";
import { CategoryRepository } from "../db/repositories/CategoryRepository";
import slugify from "slugify";

export async function getProducts(request, reply) {
  try {
    const productRepository = await getManager().getCustomRepository(ProductRepository);
    const products = await productRepository.find({ relations: ["categories", "prices", "reviews"] });
    return products;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function getSingleProduct(request, reply) {
  try {
    const id = request.params.id;
    const productRepository = await getManager().getCustomRepository(ProductRepository);
    const product = await productRepository.findOneOrFail(id, { relations: ["categories", "prices", "reviews"] });
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
      categories: product.categories,
      prices: product.prices,
      reviews: product.reviews,
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
    const categoryRepository = await getManager().getCustomRepository(CategoryRepository);
    const body = request.body;
    const categories = body.categories;
    let createdCategories: Category[] = [];

    await categories.forEach((categoryInformation) => {
      const category = new Category();
      category.name = categoryInformation.name;
      category.slug = slugify(categoryInformation.name, {lower: true, remove: /[*+~.()'"!:@]/g});
      category.description = categoryInformation.description;
      categoryRepository.save(category)
      createdCategories.push(category);
    });

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
    product.categories = createdCategories;

    const errors = await validate(product);
    if (errors.length > 0) {
      throw new Error(errors.toString()); 
    } else {
      await productRepository.save(product);
    }
    
    return product;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function updateProduct(request, reply) {
  try {
    const id = request.params.id;
    const productRepository = await getManager().getCustomRepository(ProductRepository);
    const categoryRepository = await getManager().getCustomRepository(CategoryRepository);
    const body = request.body;
    const productData: Product = await productRepository.findOne(id);
    let createdCategories: Category[] = [];
    if (body.categories != undefined || body.categories != null) {
      const categories = body.categories;

      await categories.forEach((categoryInformation) => {
        const category = new Category();
        category.name = categoryInformation.name;
        category.slug = slugify(categoryInformation.name, {lower: true, remove: /[*+~.()'"!:@]/g});
        category.description = categoryInformation.description;
        categoryRepository.save(category)
        createdCategories.push(category);
      });
    }
    

    if (createdCategories.length > 0) {
      productData.categories = createdCategories;
    }

    if (body.name != null) {
      productData.name = body.name;
      productData.slug = slugify(body.name, {lower: true, remove: /[*+~.()'"!:@]/g});;
    }

    if (body.serialNumber != null) {
      productData.serialNumber = body.serialNumber;
    } 

    if (body.manufacturer != null) {
      productData.manufacturer = body.manufacturer;
    }

    if (body.description != null) {
      productData.description = body.description;
    } 

    if (body.width != null) {
      productData.width = parseFloat(body.width);
    } 
    if (body.height != null) {
      productData.height = parseFloat(body.height);
    } 
    if (body.depth != null) {
      productData.depth = parseFloat(body.depth);
    } 
    if (body.weight != null) {
      productData.weight = parseFloat(body.weight);
    }

    if (body.images != null) {
      productData.images = body.images;
    } 

    if (body.alternatives != null) {
      productData.alternatives = body.alternatives;
    } 

    if (body.barcode != null) {
      productData.barcode = body.barcode;
    }
    const errors = await validate(productData);
    if (errors.length > 0) {
      throw new Error(errors.toString()); 
    } else {
      await productRepository.save(productData);
    }

    return productData;
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