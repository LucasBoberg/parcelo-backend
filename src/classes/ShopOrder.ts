import { Shop } from "../db/entities/Shop";
import { ShopType } from "../Utils/shop";

export class ShopOrder {
  id: string;
  slug: string;
  name: string;
  logo: string;
  type: string;

  constructor(id: string, slug: string, name: string, logo: string, type: string) {
    this.id = id;
    this.slug = slug;
    this.name = name;
    this.logo = logo;
    this.type = type;
  }

  convertShop(shop: Shop): ShopOrder {
    return new ShopOrder(String(shop.id), shop.slug, shop.name, shop.logo, shop.type);
  }
}
