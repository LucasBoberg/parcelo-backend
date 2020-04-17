import { Controller, GET, POST, PUT, DELETE, getInstanceByToken, FastifyInstanceToken } from 'fastify-decorators';
import * as boom from "@hapi/boom";
import * as path from "path";
import * as fs from "fs";
import { getManager } from "typeorm";
import { validate } from "class-validator";
import { Product } from "../db/entities/Product";
import { Category } from "../db/entities/Category";
import { ProductRepository } from "../db/repositories/ProductRepository";
import { CategoryRepository } from "../db/repositories/CategoryRepository";
import slugify from "slugify";
import { FastifyInstance } from "fastify";
import multer from "fastify-multer";
import { checkFileImage } from '../Utils/images/checkFileImage';
import ProductImageStorage from '../Utils/images/ProductImageStorage';
import { File } from 'fastify-multer/lib/interfaces';
import * as generate from "nanoid/generate";
import * as dictionary from "nanoid-dictionary/numbers";

const storage = ProductImageStorage({
  destination: function (request, file: File, cb) {
    const slug = slugify(request.body.name, {lower: true, remove: /[*+~.()'"!:@]/g});
    if (!fs.existsSync("uploads/products/" + slug)) {
      fs.mkdir("uploads/products/" + slug + "/", (error) => {
        if (error) throw boom.boomify(error);
      });
    }
    cb(null, "uploads/products/" + slug + "/");
  },
  filename: function (request, file: File, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E4);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  }
});

const upload = multer({ storage: storage, fileFilter: function(request, file, cb){ checkFileImage(file, cb) } });

@Controller({ route: "/api/products" })
export default class ProductsController {
  private static instance = getInstanceByToken<FastifyInstance>(FastifyInstanceToken);

  @GET({ url: "/", options: { schema: { tags: ["product"], querystring: { imageSize: { type: "string" } } }}})
  async getProducts(request, reply) {
    try {
      const imageSize = request.query.imageSize;
      
      const productRepository = await getManager().getCustomRepository(ProductRepository);
      const products = await productRepository.find({ relations: ["categories", "prices", "reviews", "prices.shop"] });
      const smallProducts = [];

      products.forEach((product) => {
        let image = product.images[0]
        if (imageSize) {
          image = product.images[0].replace(path.extname(product.images[0]), "") + "-" + imageSize + path.extname(product.images[0]);
        }
        const smallProduct = {
          id: product.id,
          slug: product.slug,
          name: product.name,
          manufacturer: product.manufacturer,
          description: product.description,
          color: product.color,
          image: image,
          categories: product.categories,
          prices: product.prices,
          reviews: product.reviews,
          barcode: product.barcode,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
        smallProducts.push(smallProduct);
      });

      return smallProducts;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @GET({ url: "/:id", options: { schema: { tags: ["product"], querystring: { imageSize: { type: "string" } }}}})
  async getSingleProduct(request, reply) {
    try {
      const imageSize = request.query.imageSize;
      const id = request.params.id;
      const productRepository = await getManager().getCustomRepository(ProductRepository);
      const product = await productRepository.findOneOrFail(id, { relations: ["categories", "prices", "prices.shop", "reviews"] });
      const productAlternatives = await productRepository.findByIds(product.alternatives, { select: ["id", "slug", "name", "manufacturer", "description", "images"] });
      
      let images = product.images;
      if (imageSize) {
        images = product.images.map((image) => {
          return image.replace(path.extname(image), "") + "-" + imageSize + path.extname(image);
        });
      }

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
        manufacturer: product.manufacturer,
        description: product.description,
        color: product.color,
        multiFunction: product.multiFunction,
        width: product.width,
        height: product.height,
        depth: product.depth,
        weight: product.weight,
        images: images,
        details: product.details,
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

  @POST({ url: "/", options: { 
    preValidation: [ProductsController.instance.authenticate, ProductsController.instance.isAdmin],
    preHandler: upload.array("images", 8),
    schema: { 
      tags: ["product"],
      body: {
        properties: {
          "name": {
            "type": "string"
          },
          "manufacturer": {
            "type": "string"
          },
          "description": {
            "type": "string"
          },
          "color": {
            "type": "string"
          },
          "exclusive": {
            "type": "boolean"
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
            "type": "array",
            "items": {
              "type": "string"
            }
          },
          "details": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "key": {
                  "type": "string",
                },
                "value": {
                  "type": "string"
                }
              }
            }
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
      const files = request.files;
      const slug = slugify(request.body.name, {lower: true, remove: /[*+~.()'"!:@]/g}) + "-" + generate(dictionary, 6);
      const imageDirectory = "uploads/products/" + slug;
      fs.rename("uploads/products/" + slugify(request.body.name, {lower: true, remove: /[*+~.()'"!:@]/g}), imageDirectory, (error) => {
        if (error) throw boom.boomify(error);
      });
      let images: string[] = [];
      files.forEach((file: File) => {
        images.push("/" + imageDirectory + "/" + file.filename);
      });

      const categories = JSON.parse(body.categories);
      let createdCategories: Category[] = [];
      const searchCategories: string[] = [];
  
      await categories.forEach((categoryInformation) => {
        const category = new Category();
        category.name = categoryInformation.name;
        category.slug = slugify(categoryInformation.name, {lower: true, remove: /[*+~.()'"!:@]/g});
        category.description = categoryInformation.description;
        categoryRepository.save(category)
        createdCategories.push(category);
        searchCategories.push(category.name);
      });
  
      const product = new Product();
      product.name = body.name;
      product.slug = slug;
      product.manufacturer = body.manufacturer;
      product.description = body.description;
      product.color = body.color;
      product.exclusive = body.exclusive;
      product.multiFunction = body.multiFunction;
      product.width = Number(body.width);
      product.height = Number(body.height);
      product.depth = Number(body.depth);
      product.weight = Number(body.weight);
      product.details = JSON.parse(body.details);
      product.alternatives = JSON.parse(body.alternatives);
      product.barcode = body.barcode;
      product.images = images;
      product.categories = createdCategories;
  
      const errors = await validate(product);
      if (errors.length > 0) {
        throw boom.boomify(new Error(errors.toString())); 
      } else {
        const indexes = await ProductsController.instance.search.listIndexes();
        console.log(indexes);
        const savedProduct = await productRepository.save(product);
        const searchIndex = await ProductsController.instance.search.getIndex("products");
        const response = await searchIndex.addDocuments([{ id: savedProduct.id, slug: product.slug, name: product.name, manufacturer: product.manufacturer, description: product.description, categories: searchCategories.toString(), image: product.images[0] }]);
        return savedProduct;
      }
    } catch (error) {
      throw boom.boomify(error);
    }
  }


  @POST({ url: "/old", options: { preValidation: [ProductsController.instance.authenticate, ProductsController.instance.isAdmin], schema: { 
    tags: ["product"],
    body: {
      type: "object",
      properties: {
        "name": {
          "type": "string"
        },
        "manufacturer": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "color": {
          "type": "string"
        },
        "exclusive": {
          "type": "boolean"
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
          "type": "array",
          "items": {
            "type": "string"
          }
        },
        "details": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "key": {
                "type": "string",
              },
              "value": {
                "type": "string"
              }
            }
          }
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
  async addProductOld(request, reply) {
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
      product.manufacturer = body.manufacturer;
      product.description = body.description;
      product.color = body.color;
      product.exclusive = body.exclusive;
      product.multiFunction = body.multiFunction;
      product.width = Number(body.width);
      product.height = Number(body.height);
      product.depth = Number(body.depth);
      product.weight = Number(body.weight);
      product.details = body.details;
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

      if (body.details != null) {
        productData.details = body.details;
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