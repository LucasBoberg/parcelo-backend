import { EntityRepository, Repository, FindOneOptions } from "typeorm";
import { Address } from "../entities/Address";

@EntityRepository(Address)
export class AddressRepository extends Repository<Address> {

  
  
}