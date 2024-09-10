const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getULBs = async () => {
  try {
    const ulbs = await prisma.$queryRaw`
      SELECT 
        "ulb_masters".id AS id,
        "ulb_masters".ulb_name AS ulb_name,
        "ulb_masters".longitude,
        "ulb_masters".latitude
      FROM 
        "ulb_masters";
    `;

    return ulbs;
  } catch (error) {
    console.error("Error fetching ULBs:", error);
    throw new Error("Error fetching ULBs");
  }
};

module.exports = {
  getULBs,
};
