import { Product } from "../db/entities/Product";
import { ProductOrder } from "../classes/ProductOrder";

export enum MultiFunction {
  SIZE = "size",
  COLOR = "color",
  COUNT = "count",
  SIZECOLOR = "sizeColor",
  SIZECOUNT = "sizeCount",
  COLORCOUNT = "colorCount",
  SIZECOLORCOUNT = "sizeColorCount"
}

export enum Color {
  RED = "red",
  GREEN = "green",
  BLACK = "black",
  GREY = "grey",
  WHITE = "white",
  BLUE = "blue",
  BEIGE = "beige",
  BROWN = "brown",
  YELLOW = "yellow",
  ORANGE = "orange",
  PINK = "pink",
  PURPLE = "purple",
  SILVER = "silver",
  GOLD = "gold",
  MULTICOLORED = "multiColored"
}

export function convertProduct(product: Product, price: number, currency: string): ProductOrder {
  return new ProductOrder(String(product.id), product.slug, product.name, product.serialNumber, product.manufacturer, price, currency, product.width, product.height, product.depth, product.weight, product.images[0], product.barcode);
}