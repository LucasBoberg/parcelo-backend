import { EntityRepository, Repository, Like } from "typeorm";
import { Order } from "../entities/Order";

@EntityRepository(Order)
export class OrderRepository extends Repository<Order> {

  findByStatus(status: string) {
    return this.find({ where:  { shops: Like("%'" + status + "'%") }});
  }

  findByShopId(shopId: string) {
    return this.find({ where: { shops: Like('%"' + shopId + '"%') }});
  }

  findByShopIdAndStatus(shopId: string, status: string) {
    return this.find({ where: { shops: Like(["%" + shopId + "%", "%'" + status + "'%"]) }});
  }
}