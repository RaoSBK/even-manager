import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Function to verify connection
export async function connectDb() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to PostgreSQL database using Prisma.');
  } catch (error) {
    console.error('Failed to connect to the PostgreSQL database:', error);
    process.exit(1);
  }
}

export default prisma;
