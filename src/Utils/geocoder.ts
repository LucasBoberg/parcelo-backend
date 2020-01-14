import { Address } from "../db/entities/Address";
import { LocationOrder } from "../classes/LocationOrder";

export const options = {
  provider: "openstreetmap",
  language: "en"
}

export function convertLocation(address: Address): LocationOrder {
  return new LocationOrder(String(address.id), address.street, address.postal, address.city, address.country, Number(address.latitude), Number(address.longitude));
}