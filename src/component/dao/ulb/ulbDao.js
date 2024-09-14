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
    FSR.work_in_progress
  FROM 
    "ULB" 
  LEFT JOIN 
    "FinancialSummaryReport" AS FSR
  ON 
    "ULB".id = FSR.ulb_id
  ORDER BY 
    "ULB".id ASC;
`;

    return ulbs;
  } catch (error) {
    console.error("Error fetching ULBs with financial data:", error);
    throw new Error("Error fetching ULBs with financial data");
  }
};

const getULBsAndSchemes = async () => {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        "ULB".id AS ulb_id,
        "Scheme_info".scheme_id,
        "ULB".ulb_name,
        FSR.approved_schemes AS total_schemes,
        FSR.financial_progress_in_percentage AS financial_progress_percentage_fsr,
        "Scheme_info".financial_progress AS financial_progress_schemeinfo
      FROM 
        "ULB"
      LEFT JOIN 
        "FinancialSummaryReport" AS FSR
      ON 
        "ULB".id = FSR.ulb_id
      LEFT JOIN 
        "Scheme_info"
      ON 
        "ULB".ulb_name = "Scheme_info".ulb
      WHERE
        "Scheme_info".financial_progress IS NOT NULL
      ORDER BY 
        "ULB".id ASC;
    `;

    return result;
  } catch (error) {
    console.error("Error fetching ULB and scheme data:", error);
    throw new Error("Error fetching ULB and scheme data");
  }
};

module.exports = {
  getULBs,
  getULBsAndSchemes,
};
