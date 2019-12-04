import { EntityRepository, Repository, FindOneOptions } from "typeorm";
import { Category } from "../entities/Category";

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {

}