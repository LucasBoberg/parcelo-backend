import { Controller, GET, POST, PUT, DELETE } from 'fastify-decorators';
import * as boom from "@hapi/boom";
import { getManager } from "typeorm";
import { validate } from "class-validator";
import { Category } from "../db/entities/Category";
import { CategoryRepository } from "../db/repositories/CategoryRepository";
import slugify from "slugify";

@Controller({ route: "/api/categories" })
export default class CategoriesController {
  @GET({ url: "/", options: { schema: { tags: ["category"] }}})
  async getCategories(request, reply) {
    try {
      const categoryRepository = await getManager().getCustomRepository(CategoryRepository);
      const categories = await categoryRepository.find();
      return categories;
    } catch (error) {
      throw boom.boomify(error);
    }
  }
  
  @GET({ url: "/:slug", options: { schema: { tags: ["category"] }}})
  async getSingleCategory(request, reply) {
    try {
      const slug = request.params.slug;
      const categoryRepository = await getManager().getCustomRepository(CategoryRepository);
      const category = await categoryRepository.findOneOrFail(slug, { relations: ["products", "products.prices", "products.prices.shop"] });
      const smallProducts = [];

      category.products.forEach((product) => {
        const smallProduct = {
          id: product.id,
          slug: product.slug,
          name: product.name,
          manufacturer: product.manufacturer,
          description: product.description,
          color: product.color,
          image: product.images[0],
          categories: product.categories,
          prices: product.prices,
          reviews: product.reviews,
          barcode: product.barcode,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt
        }
        smallProducts.push(smallProduct);
      });

      const smallCategory = {
        slug: category.slug,
        name: category.name,
        products: smallProducts,
        updatedAt: category.updatedAt,
        createdAt: category.createdAt
      }
    
      return smallCategory;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @POST({ url: "/", options: { schema: { 
    tags: ["category"],
    body: "#category#"
  }}})
  async addCategory(request, reply) {
    try {
      const categoryRepository = await getManager().getCustomRepository(CategoryRepository);
      const body = request.body;
  
      const category = new Category();
      category.name = body.name;
      category.slug = slugify(body.name, {lower: true, remove: /[*+~.()'"!:@]/g});
      category.description = body.description;
  
      const errors = await validate(category);
      if (errors.length > 0) {
        throw boom.boomify(new Error(errors.toString())); 
      } else {
        await categoryRepository.save(category);
      }
      
      return category;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @PUT({ url: "/:slug", options: { schema: { tags: ["category"] }}})
  async updateCategory(request, reply) {
    try {
      const slug = request.params.slug;
      const categoryRepository = await getManager().getCustomRepository(CategoryRepository);
      const body = request.body;
      const categoryData: Category = await categoryRepository.findOneOrFail(slug);
  
      if (body.name != null) {
        categoryData.name = body.name;
        categoryData.slug = slugify(body.name, {lower: true, remove: /[*+~.()'"!:@]/g});
      }
  
      if (body.description != null) {
        categoryData.description = body.description;
      } 
      const errors = await validate(categoryData);
      if (errors.length > 0) {
        throw boom.boomify(new Error(errors.toString())); 
      } else {
        await categoryRepository.save(categoryData);
      }
  
      return categoryData;
    } catch (error) {
      throw boom.boomify(error);
    }
  }

  @DELETE({ url: "/:slug", options: { schema: { tags: ["category"] }}})
  async deleteCategory(request, reply) {
    try {
      const slug = request.params.slug;
      const categoryRepository = await getManager().getCustomRepository(CategoryRepository);
      const category = await categoryRepository.findOneOrFail(slug);
      await categoryRepository.remove(category);
      return { message: slug + " was removed!" };
    } catch (error) {
      throw boom.boomify(error);
    }
  }
}