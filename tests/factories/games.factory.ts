import prisma from "config/database";
import { faker } from "@faker-js/faker";

export function createGames(id: number) {
  return prisma.game.create({
    data: {
        title: faker.lorem.text(), 
        consoleId: id
    }
  });
}