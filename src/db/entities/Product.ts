import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, JoinTable } from "typeorm";
import { Matches } from "class-validator";
import { Category } from "./Category";
import { Price } from './Price';

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
}
