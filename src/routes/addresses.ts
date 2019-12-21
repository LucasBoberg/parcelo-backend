import { HTTPMethod } from "fastify";
import { getAddresses, getSingleAddress, addAddress, updateAddress, deleteAddress } from "../controllers/AddressesController";

export const addressRoutes = [
  {
    method: "GET" as HTTPMethod,
    url: '/api/addresses',
    handler: getAddresses,
    schema: {
      tags: ["address"]
    }
  },
  {
    method: "GET" as HTTPMethod,
    url: '/api/addresses/:id',
    handler: getSingleAddress,
    schema: {
      tags: ["address"]
    }
  },
  {
    method: "POST" as HTTPMethod,
    url: '/api/addresses',
    handler: addAddress,
    schema: {
      tags: ["address"]
    }
  },
  {
    method: "PUT" as HTTPMethod,
    url: '/api/addresses/:id',
    handler: updateAddress,
    schema: {
      tags: ["address"]
    }
  },
  {
    method: "DELETE" as HTTPMethod,
    url: '/api/addresses/:id',
    handler: deleteAddress,
    schema: {
      tags: ["address"]
    }
  }
];