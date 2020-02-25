import { Entity, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from "typeorm";
import { Shop } from './Shop';
import { Product } from './Product';

@Entity()
export class Price {

  @PrimaryColumn({default: "dsadasd"})
  id: string;

  @Column()
  price: number;

  @Column()
  currency: string;

  @ManyToOne(type => Shop, shop => shop.prices, { nullable: false})
  shop: Shop;

  @ManyToOne(type => Product, product => product.prices, { nullable: false})
  product: Product;

  @CreateDateColumn() 
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
