import { PrismaClient } from '@prisma/client';

// Prevent multiple PrismaClient instances in development due to hot reloading
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Enable logging for debugging
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Export the Prisma Client instance
export default prisma;