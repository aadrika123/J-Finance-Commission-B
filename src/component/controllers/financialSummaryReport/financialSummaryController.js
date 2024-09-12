const {
  fetchFinancialSummaryReport,
  updateFinancialSummary,
} = require("../../dao/financialSummaryReport/financialSummaryDao");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Fetch and store financial summary report
const getFinancialSummaryReport = async (req, res) => {
  try {
    const { city_type, grant_type, sector, financial_year } = req.query;

    if (!city_type || !grant_type || !sector || !financial_year) {
      return res.status(400).json({
        status: false,
        message: "Missing required query parameters",
      });
    }

    const report = await fetchFinancialSummaryReport(
      city_type,
      grant_type,
      sector,
      financial_year
    );

    if (!report || report.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No financial summary report found",
      });
    }

    const result = report.map((row) => {
      return Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          key,
          typeof value === "bigint" ? value.toString() : value,
        ])
      );
    });

    for (const row of result) {
      try {
        const existingRecord = await prisma.financialSummaryReport.findUnique({
          where: { ulb_id: row.ulb_id },
        });

        if (existingRecord) {
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
              financial_year: row.financial_year || null,
              first_instalment: row.first_instalment || null,
              second_instalment: row.second_instalment || null,
              interest_amount: row.interest_amount || null,
              grant_type: row.grant_type || null,
            },
          });
        } else {
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
              financial_year: row.financial_year || null,
              first_instalment: row.first_instalment || null,
              second_instalment: row.second_instalment || null,
              interest_amount: row.interest_amount || null,
              grant_type: row.grant_type || null,
            },
          });
        }
      } catch (dbError) {
        console.error(`Error processing ULB ID ${row.ulb_id}:`, dbError);
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

// Update financial summary report
const updateFinancialSummaryReport = async (req, res) => {
  const {
    ulb_id,
    financial_year,
    first_instalment,
    second_instalment,
    interest_amount,
    grant_type,
  } = req.body;

  try {
    if (!ulb_id) {
      return res.status(400).json({
        status: false,
        message: "ULB ID is required",
      });
    }

    const updatedReport = await updateFinancialSummary({
      ulb_id,
      financial_year,
      first_instalment,
      second_instalment,
      interest_amount,
      grant_type,
    });

    if (!updatedReport) {
      return res.status(404).json({
        status: false,
        message: "Financial summary report not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Financial summary updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    console.error("Error updating financial summary:", error);
    res.status(500).json({
      status: false,
      message: "Failed to update financial summary report",
      error: error.message,
    });
  }
};

module.exports = {
  getFinancialSummaryReport,
  updateFinancialSummaryReport,
};
