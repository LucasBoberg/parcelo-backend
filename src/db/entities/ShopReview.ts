import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { Shop } from "./Shop";

@Entity()
export class ShopReview {

    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    review: string;

    @Column()
    rating: number;

    @ManyToOne(type => Shop, shop => shop.reviews)
    shop: Shop;

    @ManyToOne(type => User, user => user.shopReviews)
    user: User;

    @CreateDateColumn() 
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
