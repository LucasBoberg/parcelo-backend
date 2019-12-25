import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class DeliveryReview {

  @PrimaryGeneratedColumn("uuid")
  id: number;

  @Column()
  review: string;

  @Column()
  rating: number;

  @ManyToOne(type => User, userReviewed => userReviewed.reviews)
  userReviewed: User;

  @ManyToOne(type => User, user => user.deliveryReviews)
  user: User;

  @CreateDateColumn() 
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
