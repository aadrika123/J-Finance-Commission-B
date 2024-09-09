const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function connectToDatabase() {
  try {
    await prisma.$connect();
    console.log("Database is connected");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { prisma, connectToDatabase };
