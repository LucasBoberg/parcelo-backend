import { EntityRepository, Repository } from "typeorm";
import { Shop } from "../entities/Shop";

@EntityRepository(Shop)
export class ShopRepository extends Repository<Shop> {
  
}