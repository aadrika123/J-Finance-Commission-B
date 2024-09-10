const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const updateSchemeInfo = async (scheme_id, data) => {
  const updateData = {};

  // Only add fields to updateData if they exist in the incoming data
  if (data.sector !== undefined) updateData.sector = data.sector;
  if (data.project_completion_status !== undefined)
    updateData.project_completion_status = data.project_completion_status;
  if (data.tender_floated !== undefined)
    updateData.tender_floated = data.tender_floated;
  if (data.financial_progress !== undefined)
    updateData.financial_progress = data.financial_progress;
  if (data.financial_progress_in_percentage !== undefined)
    updateData.financial_progress_in_percentage =
      data.financial_progress_in_percentage;
  if (data.project_completion_status_in_percentage !== undefined)
    updateData.project_completion_status_in_percentage =
      data.project_completion_status_in_percentage; // Updated field

  return await prisma.scheme_info.update({
    where: { scheme_id },
    data: updateData,
  });
};

module.exports = {
  updateSchemeInfo,
};
