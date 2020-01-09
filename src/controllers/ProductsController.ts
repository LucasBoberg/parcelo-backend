import { Controller, AbstractController, GET, POST, PUT, DELETE } from 'fastify-decorators';
import * as boom from "@hapi/boom";
import { getManager } from "typeorm";
import { validate } from "class-validator";
import { Product } from "../db/entities/Product";
import { Category } from "../db/entities/Category";
import { ProductRepository } from "../db/repositories/ProductRepository";
import { CategoryRepository } from "../db/repositories/CategoryRepository";
import slugify from "slugify";

@Controller({ route: "/api/products" })
export default class ProductsController {
  @GET({ url: "/", options: { schema: { tags: ["product"] }}})
  async getProducts(request, reply) {
    try {
      const productRepository = await getManager().getCustomRepository(ProductRepository);
      const products = await productRepository.find({ relations: ["categories", "prices", "reviews"] });
      return products;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @GET({ url: "/:id", options: { schema: { tags: ["product"] }}})
  async getSingleProduct(request, reply) {
    try {
      const id = request.params.id;
      const productRepository = await getManager().getCustomRepository(ProductRepository);
      const product = await productRepository.findOneOrFail(id, { relations: ["categories", "prices", "prices.shop", "reviews"] });
      const productAlternatives = await productRepository.findByIds(product.alternatives, { select: ["id", "slug", "name", "manufacturer", "description", "images"] });
      
      let completePrices = [];
      if (product.prices.length > 0 && product.prices[0].price !== null) {
        await product.prices.forEach((priceInformation) => {
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
      
      const completeProduct = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        serialNumber: product.serialNumber,
        manufacturer: product.manufacturer,
        description: product.description,
        color: product.color,
        multiFunction: product.multiFunction,
        width: product.width,
        height: product.height,
        depth: product.depth,
        weight: product.weight,
        images: product.images,
        alternatives: productAlternatives,
        categories: product.categories,
        prices: completePrices,
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

  @GET({ url: "/barcode/:barcode", options: { schema: { tags: ["product"] }}})
  async getSingleProductByBarcode(request, reply) {
    try {
      const barcode = request.params.barcode;
      const productRepository = await getManager().getCustomRepository(ProductRepository);
      const product = await productRepository.findByBarcode(barcode);
    
      return product;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @POST({ url: "/", options: { schema: { 
    tags: ["product"],
    body: {
      type: "object",
      properties: {
        "name": {
          "type": "string"
        },
        "serialNumber": {
          "type": "string"
        },
        "manufacturer": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "width": {
          "type": "string"
        },
        "height": {
          "type": "string"
        },
        "depth": {
          "type": "string"
        },
        "weight": {
          "type": "string"
        },
        "images": {
          "type": "string"
        },
        "alternatives": {
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "barcode": {
          "type": "string"
        },
        "categories": {
          "type": "array",
          "items":"#category#"
        }
      }
    }}}})
  async addProduct(request, reply) {
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
      product.color = body.color;
      product.multiFunction = body.multiFunction;
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
        throw boom.boomify(new Error(errors.toString())); 
      } else {
        await productRepository.save(product);
      }
      
      return product;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @PUT({ url: "/:id", options: { schema: { tags: ["product"] }}})
  async updateProduct(request, reply) {
    try {
      const id = request.params.id;
      const productRepository = await getManager().getCustomRepository(ProductRepository);
      const categoryRepository = await getManager().getCustomRepository(CategoryRepository);
      const body = request.body;
      const productData: Product = await productRepository.findOneOrFail(id);
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
        productData.slug = slugify(body.name, {lower: true, remove: /[*+~.()'"!:@]/g});
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
  
      if (body.color != null) {
        productData.color = body.color;
      } 
      
      if (body.multiFunction != null) {
        productData.multiFunction = body.multiFunction;
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
        throw boom.boomify(new Error(errors.toString())); 
      } else {
        await productRepository.save(productData);
      }
  
      return productData;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @DELETE({ url: "/:id", options: { schema: { tags: ["product"] }}})
  async deleteProduct(request, reply) {
    try {
      const id = request.params.id;
      const productRepository = await getManager().getCustomRepository(ProductRepository);
      const product = await productRepository.findOneOrFail(id);
      await productRepository.remove(product);
      return { message: id + " was removed!" };
    } catch (error) {
      throw boom.boomify(error);
    }
  }
}