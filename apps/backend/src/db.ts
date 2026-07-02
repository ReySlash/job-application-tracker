import './load-env.js';
import { PrismaClient } from './generated/prisma/client.js';
import type { PrismaClient as PrismaClientType } from './generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';


const prisma: PrismaClientType = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

export async function checkDatabaseConnection() {
  await prisma.$queryRawUnsafe('SELECT 1');
}

export default prisma;
