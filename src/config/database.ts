import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import { loadEnv } from "./envs";

loadEnv();

export default prisma;