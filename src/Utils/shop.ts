import { Shop } from "../db/entities/Shop";
import { ShopOrder } from "../classes/ShopOrder";

export enum ShopType {
  STORE = "store",
  RESTAURANT = "restaurant"
}

export function convertShop(shop: Shop): ShopOrder {
  return new ShopOrder(String(shop.id), shop.slug, shop.name, shop.logo, shop.type);
}