const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const moment = require("moment-timezone");

const generateSchemeId = async () => {
  // Get the latest scheme_info record
  const lastScheme = await prisma.scheme_info.findFirst({
    orderBy: {
      scheme_id: "desc",
    },
  });

  // Extract the number from the last scheme_id and increment it
  let newSchemeNumber = 1;
  if (lastScheme) {
    const lastSchemeId = lastScheme.scheme_id;
    const lastNumber = parseInt(lastSchemeId.split("-").pop(), 10);
    newSchemeNumber = lastNumber + 1;
  }

  // Format the new scheme_id as sch-03-001
  const newSchemeId = `sch-03-${newSchemeNumber.toString().padStart(3, "0")}`;

  return newSchemeId;
};

const createSchemeInfo = async (data) => {
  // Generate the new scheme_id
  const scheme_id = await generateSchemeId();

  const dateInUTC = moment
    .tz(data.date_of_approved, "Asia/Kolkata")
    .utc()
    .toDate();

  return await prisma.scheme_info.create({
    data: {
      scheme_id, // Use the generated scheme_id
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

const getSchemeInfo = async () => {
  return await prisma.scheme_info.findMany();
};
module.exports = {
  createSchemeInfo,
  getSchemeInfo,
};
