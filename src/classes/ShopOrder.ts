import { ProductOrder } from "./ProductOrder";

export class ShopOrder {
  id: string;
  slug: string;
  name: string;
  logo: string;
  type: string;
  status: string;
  pickupTime: string;
  products: ProductOrder[];

  constructor(id: string, slug: string, name: string, logo: string, type: string, status: string, products: ProductOrder[]) {
    this.id = id;
    this.slug = slug;
    this.name = name;
    this.logo = logo;
    this.type = type;
    this.status = status;
    this.pickupTime = "null";
    this.products = products;
  }
}
