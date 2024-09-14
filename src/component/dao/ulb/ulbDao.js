const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getULBs = async () => {
  try {
    const ulbs = await prisma.$queryRaw`
      SELECT 
        "ULB".id AS id,
        "ULB".ulb_name AS ulb_name,
        "ULB".longitude,
        "ULB".latitude,
        FSR.approved_schemes,
        FSR.fund_release_to_ulbs,
        FSR.amount,
        FSR.project_completed,
        FSR.expenditure,
        FSR.balance_amount,
        FSR.financial_progress_in_percentage,
        FSR.number_of_tender_floated,
        FSR.tender_not_floated,
        FSR.work_in_progress,
        SUM(SI.financial_progress) AS total_financial_progress
      FROM 
        "ULB" 
      LEFT JOIN 
        "FinancialSummaryReport" AS FSR
      ON 
        "ULB".id = FSR.ulb_id
      LEFT JOIN 
        "Scheme_info" AS SI
      ON 
        "ULB".ulb_name = SI.ulb
      GROUP BY 
        "ULB".id, FSR.approved_schemes, FSR.fund_release_to_ulbs, FSR.amount, 
        FSR.project_completed, FSR.expenditure, FSR.balance_amount, 
        FSR.financial_progress_in_percentage, FSR.number_of_tender_floated, 
        FSR.tender_not_floated, FSR.work_in_progress
      ORDER BY 
        "ULB".id ASC;
    `;

    return ulbs;
  } catch (error) {
    console.error("Error fetching ULBs with financial data:", error);
    throw new Error("Error fetching ULBs with financial data");
  }
};

module.exports = {
  getULBs,
};
