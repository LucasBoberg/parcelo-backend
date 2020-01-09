import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { ProductOrder } from "../../classes/ProductOrder";
import { ShopOrder } from "../../classes/ShopOrder";

@Entity()
export class Order {
  @PrimaryGeneratedColumn("uuid")
  orderNumber: number;

  @Column()
  total: number;

  @Column()
  currency: string;

  @ManyToOne(type => User, user => user.orders)
  user: User;

  @Column("simple-json")
  products: ProductOrder[];

  @Column("simple-json")
  shops: ShopOrder[];

  @CreateDateColumn() 
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
