import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, OneToMany, JoinTable } from "typeorm";
import { Matches } from "class-validator";
import { Category } from "./Category";
import { Price } from './Price';
import { ProductReview } from './ProductReview';

@Entity()
export class Product {

    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    @Matches(new RegExp('^[a-z][a-z\-]*[a-z]$'))
    slug: string;

    @Column()
    name: string;

    @Column()
    serialNumber: string;

    @Column()
    manufacturer: string;

    @Column()
    description: string;

    @OneToMany(type => Price, price => price.product)
    prices: Price[];

    @OneToMany(type => ProductReview, review => review.product)
    reviews: ProductReview[];

    @Column()
    width: number;

    @Column()
    height: number;

    @Column()
    depth: number;

    @Column()
    weight: number;

    @Column()
    images: string;

    @Column()
    alternatives: string;

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
