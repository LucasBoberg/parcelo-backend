import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Double } from "typeorm";

@Entity()
export class Address {

    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    name: string;

    @Column()
    street: string;

    @Column()
    postal: string;

    @Column()
    city: string;

    @Column()
    country: string;

    @Column()
    latitude: Double;

    @Column()
    longitude: Double;

    @CreateDateColumn() 
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
