import { Entity, PrimaryGeneratedColumn, PrimaryColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { ShopOrder } from "../../classes/ShopOrder";
import { LocationOrder } from "../../classes/LocationOrder";
import * as generate from "nanoid/generate";
import * as dictionary from "nanoid-dictionary/numbers";

@Entity()
export class Order {
  //@PrimaryGeneratedColumn("uuid")
  @PrimaryColumn('varchar')
  orderNumber: number;

  @Column()
  total: number;

  @Column()
  currency: string;

  @ManyToOne(type => User, user => user.orders)
  user: User;

  @ManyToOne(type => User, user => user.deliveries, { nullable: true })
  deliverer: User;

  @Column("simple-json")
  shops: ShopOrder[];

  @Column("simple-json")
  locations: LocationOrder[];

  @CreateDateColumn() 
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
