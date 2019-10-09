import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Address {

    @PrimaryGeneratedColumn("uuid")
    id: number;

    @Column()
    street: string;

    @Column()
    postal: string;

    @Column()
    city: string;

    @Column()
    country: string;
}
