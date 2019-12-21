import * as boom from "@hapi/boom";
import { getManager } from "typeorm";
import { validate } from "class-validator";
import { Address } from "../db/entities/Address";
import { AddressRepository } from "../db/repositories/AddressRepository";
import slugify from "slugify";

export async function getAddresses(request, reply) {
  try {
    const addressRepository = await getManager().getCustomRepository(AddressRepository);
    const addresses = await addressRepository.find();
    return addresses;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function getSingleAddress(request, reply) {
  try {
    const id = request.params.id;
    const addressRepository = await getManager().getCustomRepository(AddressRepository);
    const address = await addressRepository.findOneOrFail(id);
    return address;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function addAddress(request, reply) {
  try {
    const addressRepository = await getManager().getCustomRepository(AddressRepository);
    const body = request.body;

    const address = new Address();
    address.name = body.name;
    address.street = body.street;
    address.postal = body.postal;
    address.city = body.city;
    address.country = body.country;
    address.latitude = body.latitude;
    address.longitude = body.longitude;

    const errors = await validate(address);
    if (errors.length > 0) {
      throw boom.boomify(new Error(errors.toString())); 
    } else {
      await addressRepository.save(address);
    }
    
    return address;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function updateAddress(request, reply) {
  try {
    const id = request.params.id;
    const addressRepository = await getManager().getCustomRepository(AddressRepository);
    const body = request.body;
    const addressData: Address = await addressRepository.findOneOrFail(id);

    if (body.name != null) {
      addressData.name = body.name;
    }
    if (body.street != null) {
      addressData.street = body.street;
    }
    if (body.postal != null) {
      addressData.postal = body.postal;
    }
    if (body.city != null) {
      addressData.city = body.city;
    }
    if (body.country != null) {
      addressData.country = body.country;
    }
    if (body.latitude != null) {
      addressData.latitude = body.latitude;
    }
    if (body.longitude != null) {
      addressData.longitude = body.longitude;
    }
    const errors = await validate(addressData);
    if (errors.length > 0) {
      throw boom.boomify(new Error(errors.toString())); 
    } else {
      await addressRepository.save(addressData);
    }

    return addressData;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function deleteAddress(request, reply) {
  try {
    const id = request.params.id;
    const addressRepository = await getManager().getCustomRepository(AddressRepository);
    const address = await addressRepository.findOneOrFail(id);
    await addressRepository.remove(address);
    return { message: id + " was removed!" };
  } catch (error) {
    throw boom.boomify(error);
  }
}