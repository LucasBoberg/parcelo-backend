import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany, JoinTable } from "typeorm";
import { IsEmail } from "class-validator";
import { Address } from "./Address";
import { ProductReview } from "./ProductReview";
import { ShopReview } from "./ShopReview";
import { DeliveryReview } from "./DeliveryReview";
import { UserRole } from "../../Utils/user";

@Entity()
export class User {

    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.BUYER
    })
    role: UserRole

    @Column()
    @IsEmail()
    email: string;

    @Column()
    password: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @ManyToMany(type => Address)
    @JoinTable()
    addresses: Address[];

    @OneToMany(type => ProductReview, productReview => productReview.user)
    productReviews: ProductReview[];

    @OneToMany(type => ShopReview, shopReview => shopReview.user)
    shopReviews: ShopReview[];

    @OneToMany(type => DeliveryReview, deliveryReview => deliveryReview.user)
    deliveryReviews: DeliveryReview[];

    @OneToMany(type => DeliveryReview, review => review.userReviewed)
    reviews: DeliveryReview[];

    @CreateDateColumn() 
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
