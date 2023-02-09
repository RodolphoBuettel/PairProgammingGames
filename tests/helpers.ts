import prisma from "config/database";

export async function cleanDb() {
  await prisma.game.deleteMany({});
  await prisma.console.deleteMany({});
}

export async function connect() {
  return await prisma.$connect();
}

export async function disconnectDb() {
  await prisma.$disconnect();
}