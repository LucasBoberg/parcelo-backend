import { Product } from "../db/entities/Product";

export class ProductOrder {
  id: string;
  slug: string;
  name: string;
  serialNumber: string;
  manufacturer: string;
  price: number;
  currency: string;
  width: number;
  height: number;
  depth: number;
  weight: number;
  image: string;
  barcode: string;

  constructor(id: string, slug: string, name: string, serialNumber: string, manufacturer: string, price: number, currency: string, width: number, height: number, depth: number, weight: number, image: string, barcode: string) {
    this.id = id;
    this.slug = slug;
    this.name = name;
    this.serialNumber = serialNumber;
    this.manufacturer = manufacturer;
    this.price = price;
    this.currency = currency;
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.weight = weight;
    this.image = image;
    this.barcode = barcode;
  }
}
