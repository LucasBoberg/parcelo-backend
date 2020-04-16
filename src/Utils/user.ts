export interface userPayload {
  id: string,
  role: string,
  email: string,
  verifiedEmail: boolean,
  iat: number,
  exp: number
}

export enum UserRole {
  BUYER = "buyer",
  SHOPOWNER = "shopOwner",
  DELIVERER = "deliverer",
  ADMIN = "admin"
}