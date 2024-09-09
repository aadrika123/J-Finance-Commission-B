const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const moment = require("moment-timezone");

const createSchemeInfo = async (data) => {
  const dateInUTC = moment
    .tz(data.date_of_approved, "Asia/Kolkata")
    .utc()
    .toDate();

  return await prisma.scheme_info.create({
    data: {
      scheme_id: data.scheme_id,
      project_cost: data.project_cost,
      approved_project_cost: data.project_cost,
      scheme_name: data.scheme_name,
      sector: data.sector,
      grant_type: data.grant_type,
      city_type: data.city_type,
      date_of_approved: dateInUTC,
      created_at: new Date(), // Automatically handled by Prisma in UTC
      ulb: data.ulb,
    },
  });
};

module.exports = {
  createSchemeInfo,
};
