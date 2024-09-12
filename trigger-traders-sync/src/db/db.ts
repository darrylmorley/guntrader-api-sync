import { PrismaClient } from "@prisma/client";

// Add Prisma Client as a global variable to avoid reinitialization in development
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(); // Use a new PrismaClient for each production instance
} else {
  // For development, avoid exhausting your database connection pool by reusing the same instance
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prisma = (global as any).prisma;
}

export default prisma;
