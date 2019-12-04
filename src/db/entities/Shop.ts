import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany, JoinTable } from "typeorm";
import { Matches } from "class-validator";
import { Address } from "./Address";
import { Price } from './Price';
import { ShopReview } from './ShopReview';
import { ShopType } from "../../Utils/shop";

@Entity()
export class Shop {

    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    @Matches(new RegExp('^[a-z0-9]+(?:-[a-z0-9]+)*$'))
    slug: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ type: "enum", enum: ShopType, default: ShopType.STORE })
    type: ShopType

    @OneToMany(type => Price, price => price.shop)
    prices: Price[];

    @OneToMany(type => ShopReview, review => review.shop)
    reviews: ShopReview[];

    @ManyToMany(type => Address)
    @JoinTable()
    addresses: Address[];

    @CreateDateColumn() 
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
