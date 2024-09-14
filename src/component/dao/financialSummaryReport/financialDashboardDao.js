const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getFilteredFinancialSummary = async (filters) => {
  const { ulb_name, grant_type, financial_year, sector } = filters;

  try {
    const result = await prisma.$queryRaw`
      SELECT 
        "FinancialSummaryReport".ulb_id,
        "FinancialSummaryReport".ulb_name,
        ("FinancialSummaryReport".number_of_tender_floated + "FinancialSummaryReport".tender_not_floated) AS approved_project,
        "FinancialSummaryReport".number_of_tender_floated AS tender_approved,
        "FinancialSummaryReport".amount AS approved_amount,
        "FinancialSummaryReport".expenditure,
        "FinancialSummaryReport".financial_year,
        "FinancialSummaryReport".grant_type,
        "Scheme_info".sector,
        "Scheme_info".city_type
      FROM 
        "FinancialSummaryReport"
      INNER JOIN 
        "Scheme_info"
      ON 
        "FinancialSummaryReport".ulb_name = "Scheme_info".ulb
      WHERE 
        "Scheme_info".city_type = 'Million Plus Cities'
      AND 
        (${
          ulb_name ? `"FinancialSummaryReport".ulb_name = ${ulb_name}` : "TRUE"
        })
      AND 
        (${
          grant_type
            ? `"FinancialSummaryReport".grant_type = ${grant_type}`
            : "TRUE"
        })
      AND 
        (${
          financial_year
            ? `"FinancialSummaryReport".financial_year = ${financial_year}`
            : "TRUE"
        })
      AND 
        (${sector ? `"Scheme_info".sector = ${sector}` : "TRUE"})
      ORDER BY 
        "FinancialSummaryReport".ulb_id ASC;
    `;

    return result;
  } catch (error) {
    console.error("Error fetching financial summary data:", error);
    throw new Error("Error fetching financial summary data");
  }
};

module.exports = {
  getFilteredFinancialSummary,
};
