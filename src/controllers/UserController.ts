import * as boom from "@hapi/boom";
import { getManager } from "typeorm";
import { User } from "../db/entities/User";
import { UserRepository } from "../db/repositories/UserRepository";

export async function getUsers(request, reply) {
  try {
    const userRepository = await getManager().getCustomRepository(UserRepository);
    const users = await userRepository.find();
    return users;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function getSingleUser(request, reply) {
  try {
    const id = request.params.id;
    const userRepository = await getManager().getCustomRepository(UserRepository);
    const user = await userRepository.findOneOrFail(id, { relations: ["addresses"] });
    return user;
  } catch (error) {
    throw boom.boomify(error);
  }
}

export async function signUp(request, reply) {
  /*const body = ctx.request.body;
  
  const userRepository = await getManager().getCustomRepository(UserRepository);

  const user = new User();
  user.firstName = body.firstName;
  user.lastName = body.lastName;
  user.email = body.email;
  user.password = body.password;
  await userRepository.save(user);
  ctx.body = {
    message: "Saved new user",
    data: user
  }*/
}