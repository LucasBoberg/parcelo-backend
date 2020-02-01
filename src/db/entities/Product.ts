import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany, JoinTable } from "typeorm";
import { Matches, IsUUID } from "class-validator";
import { Category } from "./Category";
import { Price } from './Price';
import { ProductReview } from './ProductReview';
import { MultiFunction, Color } from "../../Utils/product";
import { ProductDetail } from "../../classes/ProductDetail";

@Entity()
export class Product {

  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  @Matches(new RegExp('^[a-z0-9]+(?:-[a-z0-9]+)*$'))
  slug: string;

  @Column()
  name: string;

  @Column()
  manufacturer: string;

  @Column()
  description: string;

  @Column({ type: "enum", enum: Color, default: Color.WHITE })
  color: Color

  @Column({ type: "enum", enum: MultiFunction, default: MultiFunction.COUNT })
  multiFunction: MultiFunction

  @OneToMany(type => Price, price => price.product)
  prices: Price[];

  @OneToMany(type => ProductReview, review => review.product)
  reviews: ProductReview[];
  
  @Column({ default: false })
  exclusive: boolean;

  @Column("float")
  width: number;

  @Column("float")
  height: number;

  @Column("float")
  depth: number;

  @Column("float")
  weight: number;

  @Column("simple-array")
  images: string[];

  @Column("simple-json", { default: [] })
  details: ProductDetail[];

  @Column("simple-array")
  @IsUUID("4", {each: true})
  alternatives: string[];

  @Column()
  barcode: string;

  @ManyToMany(type => Category, category => category.products)
  @JoinTable()
  categories: Category[];

  @CreateDateColumn() 
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
