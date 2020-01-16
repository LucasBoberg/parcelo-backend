import { Entity, PrimaryGeneratedColumn, OneToOne, Column, JoinTable, ManyToMany, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { Product } from "./Product";

@Entity()
export class Cart {

  @PrimaryGeneratedColumn("uuid")
  id: number;

  @OneToOne(type => User, user => user.cart)
  user: User;

  @Column({ default: 0 })
  total: number;

  @Column()
  currency: string;

  @ManyToMany(type => Product)
  @JoinTable()
  products: Product[];

  @UpdateDateColumn()
  updatedAt: Date;
}
