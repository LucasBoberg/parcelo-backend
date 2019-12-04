import * as boom from "@hapi/boom";
import { getManager } from "typeorm";
import { validate } from "class-validator";
import { Category } from "../db/entities/Category";
import { CategoryRepository } from "../db/repositories/CategoryRepository";
import slugify from "slugify";

export async function getCategories(request, reply) {
  try {
    const categoryRepository = await getManager().getCustomRepository(CategoryRepository);
    const categories = await categoryRepository.find();
    return categories;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function getSingleCategory(request, reply) {
  try {
    const slug = request.params.slug;
    const categoryRepository = await getManager().getCustomRepository(CategoryRepository);
    const category = await categoryRepository.findOneOrFail(slug, { relations: ["products"] });
  
    return category;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function addCategory(request, reply) {
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

export async function updateCategory(request, reply) {
  try {
    const slug = request.params.slug;
    const categoryRepository = await getManager().getCustomRepository(CategoryRepository);
    const body = request.body;
    const categoryData: Category = await categoryRepository.findOne(slug);

    if (body.name != null) {
      categoryData.name = body.name;
      categoryData.slug = slugify(body.name, {lower: true, remove: /[*+~.()'"!:@]/g});;
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

export async function deleteCategory(request, reply) {
  try {
    const slug = request.params.slug;
    const categoryRepository = await getManager().getCustomRepository(CategoryRepository);
    const category = await categoryRepository.findOne(slug);
    await categoryRepository.remove(category);
    return { message: slug + " was removed!" };
  } catch (error) {
    throw boom.boomify(error);
  }
}