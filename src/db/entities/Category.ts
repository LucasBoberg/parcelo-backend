import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Matches } from "class-validator";
import { Product } from "./Product";

@Entity()
export class Category {

    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    @Matches(new RegExp('^[a-z][a-z\-]*[a-z]$'))
    slug: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @ManyToMany(type => Product, product => product.categories)
    products: Product[];
}
