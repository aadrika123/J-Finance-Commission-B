const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllULBs = async () => {
  return await prisma.uLB.findMany({
    select: {
      ulb_id: true,
      name: true,
      latitude: true,
      longitude: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

module.exports = {
  getAllULBs,
};
