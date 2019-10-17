import { Entity, PrimaryColumn, BeforeUpdate, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from "typeorm";
import { Matches } from "class-validator";
import slugify from "slugify";
import { Product } from "./Product";

@Entity()
export class Category {

    @PrimaryColumn()
    @Matches(new RegExp('^[a-z0-9]+(?:-[a-z0-9]+)*$'))
    slug: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @ManyToMany(type => Product, product => product.categories)
    products: Product[];

    @CreateDateColumn() 
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
