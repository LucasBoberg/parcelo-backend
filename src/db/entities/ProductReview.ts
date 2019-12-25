import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { Product } from "./Product";

@Entity()
export class ProductReview {

  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  review: string;

  @Column()
  rating: number;

  @ManyToOne(type => Product, product => product.reviews)
  product: Product;

  @ManyToOne(type => User, user => user.productReviews)
  user: User;

  @CreateDateColumn() 
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
