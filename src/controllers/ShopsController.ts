import * as boom from "@hapi/boom";
import { getManager } from "typeorm";
import { validate } from "class-validator";
import * as NodeGeoCoder from "node-geocoder";
import { options } from "../Utils/geocoder";
import { Shop } from "../db/entities/Shop";
import { Address } from "../db/entities/Address";
import { ShopRepository } from "../db/repositories/ShopRepository";
import slugify from "slugify";

const geocoder = NodeGeoCoder(options);

export async function getShops(request, reply) {
  try {
    const shopRepository = await getManager().getCustomRepository(ShopRepository);
    const shops = await shopRepository.find({ relations: ["addresses"] });
    return shops;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function getSingleShop(request, reply) {
  try {
    const id = request.params.id;
    const shopRepository = await getManager().getCustomRepository(ShopRepository);
    const shop = await shopRepository.findOneOrFail(id, { relations: ["prices", "prices.product", "reviews", "addresses"] });

    let completePrices = [];

    if (shop.prices.length > 0) {
      await shop.prices.forEach((priceInformation) => {
        const priceObject = {
          price: priceInformation.price,
          currency: priceInformation.currency,
          product: {
            id: priceInformation.product.id,
            slug: priceInformation.product.slug,
            name: priceInformation.product.name,
            serialNumber: priceInformation.product.serialNumber,
            manufacturer: priceInformation.product.manufacturer,
            description: priceInformation.product.description,
            image: priceInformation.product.images[0]
          },
          createdAt: priceInformation.createdAt,
          updatedAt: priceInformation.updatedAt
        }
        completePrices.push(priceObject)
      });
    }

    const completeShop = {
      id: shop.id,
      slug: shop.slug,
      name: shop.name,
      description: shop.description,
      type: shop.type,
      logo: shop.logo,
      banner: shop.banner,
      prices: completePrices
    }
  
    return completeShop;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function addShop(request, reply) {
  try {
    const shopRepository = await getManager().getCustomRepository(ShopRepository);
    const body = request.body;

    const shop = new Shop();
    shop.name = body.name;
    shop.slug = slugify(body.name, {lower: true, remove: /[*+~.()'"!:@]/g});
    shop.description = body.description;
    shop.type = body.type;
    shop.logo = body.logo;
    shop.banner = body.banner;
    shop.addresses = [];

    const errors = await validate(shop);
    if (errors.length > 0) {
      throw boom.boomify(new Error(errors.toString())); 
    } else {
      await shopRepository.save(shop);
    }
    
    return shop;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function updateShop(request, reply) {
  try {
    const id = request.params.id;
    const shopRepository = await getManager().getCustomRepository(ShopRepository);
    const body = request.body;
    const shopData: Shop = await shopRepository.findOneOrFail(id);

    if (body.name != null) {
      shopData.name = body.name;
      shopData.slug = slugify(body.name, {lower: true, remove: /[*+~.()'"!:@]/g});
    }

    if (body.description != null) {
      shopData.description = body.description;
    }

    if (body.type != null) {
      shopData.type = body.type;
    } 

    if (body.logo != null) {
      shopData.logo = body.logo;
    } 
    if (body.banner != null) {
      shopData.banner = body.banner;
    } 

    const errors = await validate(shopData);
    if (errors.length > 0) {
      throw boom.boomify(new Error(errors.toString())); 
    } else {
      await shopRepository.save(shopData);
    }

    return shopData;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function deleteShop(request, reply) {
  try {
    const id = request.params.id;
    const shopRepository = await getManager().getCustomRepository(ShopRepository);
    const shop = await shopRepository.findOneOrFail(id);
    await shopRepository.remove(shop);
    return { message: id + " was removed!" };
  } catch (error) {
    throw boom.boomify(error);
  }
}