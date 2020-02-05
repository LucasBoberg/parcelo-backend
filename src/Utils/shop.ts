import { Shop } from "../db/entities/Shop";
import { ShopOrder } from "../classes/ShopOrder";

export enum ShopType {
  STORE = "store",
  RESTAURANT = "restaurant"
}

export enum ShopStatus {
  WAITING = "waiting",
  PREPARING = "preparing",
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  COMPLETED = "completed"
}

export function convertShop(shop: Shop): ShopOrder {
  return new ShopOrder(String(shop.id), shop.slug, shop.name, shop.logo, shop.type, "waiting", []);
}