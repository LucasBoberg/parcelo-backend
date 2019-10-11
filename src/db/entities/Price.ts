import { Entity, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Shop } from './Shop';
import { Product } from './Product';

@Entity()
export class Price {
    @Column()
    price: number;

    @Column()
    currency: string;

    @ManyToOne(type => Shop, shop => shop.prices, { primary: true, nullable: false})
    shop: Shop;

    @ManyToOne(type => Product, product => product.prices, { primary: true, nullable: false})
    product: Product;

    @CreateDateColumn() 
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
