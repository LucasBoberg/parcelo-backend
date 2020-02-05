import { EntityRepository, Repository, Like } from "typeorm";
import { Order } from "../entities/Order";

@EntityRepository(Order)
export class OrderRepository extends Repository<Order> {

  findByStatus(status: string, relations?: string[]) {
    return this.find({ where:  { shops: Like("%" + status + "%") }, relations: relations });
  }

  findByShopId(shopId: string, relations?: string[]) {
    return this.find({ where:  { shops: Like("%" + shopId + "%") }, relations: relations });
  }

  findByShopIdAndStatus(shopId: string, status: string) {
    return this.find({ where: [
      { shops: Like("%" + shopId + "%") },
      { shops: Like("%" + status + "%") }
    ]});
  }
}