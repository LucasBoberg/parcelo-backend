import { EntityRepository, Repository, FindOneOptions } from "typeorm";
import { Product } from "../entities/Product";

@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {

  findByBarcode(barcode: string, options?: FindOneOptions<Product>): Promise<Product|undefined> {
    return this.findOne({ barcode }, options);
  }
  
}