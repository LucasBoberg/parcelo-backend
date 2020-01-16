import { EntityRepository, Repository, FindOneOptions } from "typeorm";
import { Cart } from "../entities/Cart";

@EntityRepository(Cart)
export class CartRepository extends Repository<Cart> {

}