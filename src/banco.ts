import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

const urlBanco: string | undefined = process.env.DATABASE_URL;

if (!urlBanco) {
  throw new Error("DATABASE_URL não definida no .env");
}

const adapter: PrismaPg = new PrismaPg(urlBanco);

export const prisma: PrismaClient = new PrismaClient({ adapter });
