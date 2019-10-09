import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, JoinTable } from "typeorm";
import { Matches } from "class-validator";
import { Address } from "./Address";
import { Price } from './Price';

@Entity()
export class Shop {

    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    @Matches(new RegExp('^[a-z][a-z\-]*[a-z]$'))
    slug: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @OneToMany(type => Price, price => price.shop)
    prices: Price[];

    @ManyToMany(type => Address)
    @JoinTable()
    addresses: Address[];
}
