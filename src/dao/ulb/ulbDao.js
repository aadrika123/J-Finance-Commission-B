const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getULBs = async () => {
  try {
    const ulbs = await prisma.$queryRaw`
      SELECT 
        "ULB".id AS id,
        "ULB".ulb_name AS ulb_name,
        "ULB".longitude,
        "ULB".latitude
      FROM 
        "ULB";
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
