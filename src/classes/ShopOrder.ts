import { Shop } from "../db/entities/Shop";

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
}
