const {
  fetchFinancialSummaryReport,
} = require("../dao/financialSummaryReport/financialSummaryDao");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getFinancialSummaryReport = async (req, res) => {
  try {
    const { city_type, grant_type, sector, financial_year } = req.query;

    const report = await fetchFinancialSummaryReport(
      city_type,
      grant_type,
      sector,
      financial_year
    );

    const result = report.map((row) => {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          typeof value === "bigint" ? value.toString() : value,
        ])
      );
    });

    // Update or insert the report in FinancialSummaryReport table
    for (const row of result) {
      // Check if the record already exists
      const existingRecord = await prisma.financialSummaryReport.findUnique({
        where: { ulb_id: row.ulb_id },
      });

      if (existingRecord) {
        // Update existing record
        await prisma.financialSummaryReport.update({
          where: { ulb_id: row.ulb_id },
          data: {
            ulb_name: row.ulb_name,
            approved_schemes: parseInt(row.approved_schemes, 10),
            fund_release_to_ulbs: parseFloat(row.fund_release_to_ulbs) || 0,
            amount: parseFloat(row.amount) || 0,
            project_completed: parseInt(row.project_completed, 10),
            expenditure: parseFloat(row.expenditure) || 0,
            balance_amount: parseFloat(row.balance_amount) || 0,
            financial_progress_in_percentage:
              parseInt(row.financial_progress_in_percentage, 10) || 0,
            number_of_tender_floated: parseInt(
              row.number_of_tender_floated,
              10
            ),
            tender_not_floated: parseInt(row.tender_not_floated, 10),
            work_in_progress: parseInt(row.work_in_progress, 10),
            financial_year: null, // Default value, to be updated later
            first_instalment: null,
            second_instalment: null,
            interest_amount: null,
            grant_type: null,
          },
        });
      } else {
        // Insert new record
        await prisma.financialSummaryReport.create({
          data: {
            ulb_id: row.ulb_id,
            ulb_name: row.ulb_name,
            approved_schemes: parseInt(row.approved_schemes, 10),
            fund_release_to_ulbs: parseFloat(row.fund_release_to_ulbs) || 0,
            amount: parseFloat(row.amount) || 0,
            project_completed: parseInt(row.project_completed, 10),
            expenditure: parseFloat(row.expenditure) || 0,
            balance_amount: parseFloat(row.balance_amount) || 0,
            financial_progress_in_percentage:
              parseInt(row.financial_progress_in_percentage, 10) || 0,
            number_of_tender_floated: parseInt(
              row.number_of_tender_floated,
              10
            ),
            tender_not_floated: parseInt(row.tender_not_floated, 10),
            work_in_progress: parseInt(row.work_in_progress, 10),
            financial_year: null, // Default value, to be updated later
            first_instalment: null,
            second_instalment: null,
            interest_amount: null,
            grant_type: null,
          },
        });
      }
    }

    res.status(200).json({
      status: true,
      message: "Financial summary report fetched and stored successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching financial summary report:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch and store financial summary report",
      error: error.message,
    });
  }
};

module.exports = {
  getFinancialSummaryReport,
};
