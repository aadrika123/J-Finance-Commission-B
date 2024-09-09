const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllULBs = async () => {
  return await prisma.uLB.findMany({
    include: {
      ulbMaster: {
        select: {
          latitude: true,
          longitude: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
};

module.exports = {
  getAllULBs,
};
