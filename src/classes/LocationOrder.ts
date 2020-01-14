import { Address } from "../db/entities/Address";

export class LocationOrder {
  id: string;
  street: string;
  postal: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;

  constructor(id: string, street: string, postal: string, city: string, country: string, latitude: number, longitude: number) {
    this.id = id;
    this.street = street;
    this.postal = postal;
    this.city = city;
    this.country = country;
    this.latitude = latitude;
    this.longitude = longitude;
  }
}
