export class ShopOrder {
  id: string;
  slug: string;
  name: string;
  logo: string;
  type: string;
  status: string;

  constructor(id: string, slug: string, name: string, logo: string, type: string, status: string) {
    this.id = id;
    this.slug = slug;
    this.name = name;
    this.logo = logo;
    this.type = type;
    this.status = status;
  }
}
