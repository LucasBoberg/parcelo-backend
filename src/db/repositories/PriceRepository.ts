import { EntityRepository, Repository, FindOneOptions } from "typeorm";
import { Price } from "../entities/Price";

@EntityRepository(Price)
export class PriceRepository extends Repository<Price> {

}