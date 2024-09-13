const {
  fetchFinancialSummaryReport,
  updateFinancialSummary,
} = require("../../dao/financialSummaryReport/financialSummaryDao");
const { PrismaClient } = require("@prisma/client");
const logger = require("../../../utils/log/logger");
const prisma = new PrismaClient();
const createAuditLog = require("../../../utils/auditLog/auditLogger");

const getFinancialSummaryReport = async (req, res) => {
  try {
    logger.info("Fetching financial summary report...");
    const { city_type, grant_type, sector, financial_year } = req.query;

    // Fetch the report based on query parameters
    const report = await fetchFinancialSummaryReport(
      city_type,
      grant_type,
      sector,
      financial_year
    );

    logger.info("Financial summary report fetched successfully.");

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
      const ulbId = parseInt(row.ulb_id, 10); // Ensure ulb_id is an integer

      const existingRecord = await prisma.financialSummaryReport.findUnique({
        where: { ulb_id: ulbId },
      });

      if (existingRecord) {
        // If the record exists, update it
        await prisma.financialSummaryReport.update({
          where: { ulb_id: ulbId },
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
            financial_year:
              existingRecord.financial_year || row.financial_year || null,
            first_instalment:
              existingRecord.first_instalment || row.first_instalment || null,
            second_instalment:
              existingRecord.second_instalment || row.second_instalment || null,
            interest_amount:
              existingRecord.interest_amount || row.interest_amount || null,
            grant_type: existingRecord.grant_type || row.grant_type || null,
          },
        });

        // Create an audit log entry for the update
        await createAuditLog(
          req.user.id, // User ID
          "update", // Action type
          "FinancialSummaryReport", // Table name
          ulbId, // Record ID (ulb_id)
          row // Changed data
        );
      } else {
        // If the record does not exist, create a new one
        await prisma.financialSummaryReport.create({
          data: {
            ulb_id: ulbId,
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

        // Create an audit log entry for the creation
        await createAuditLog(
          req.user.id, // User ID
          "create", // Action type
          "FinancialSummaryReport", // Table name
          ulbId, // Record ID (ulb_id)
          row // Changed data
        );
      }
    }

    logger.info("Financial summary report processed successfully.");
    res.status(200).json({
      status: true,
      message: "Financial summary report fetched and stored successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error fetching financial summary report: ${error.message}`);
    res.status(500).json({
      status: false,
      message: "Failed to fetch and store financial summary report",
      error: error.message,
    });
  }
};

// Update the financial summary report
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
      logger.info("ULB ID is missing in the request.");
      return res.status(400).json({
        status: false,
        message: "ULB ID is required",
      });
    }

    const ulbIdInt = parseInt(ulb_id, 10); // Ensure ulb_id is an integer

    logger.info(`Updating financial summary report for ULB ID: ${ulbIdInt}`);

    const updatedReport = await updateFinancialSummary({
      ulb_id: ulbIdInt,
      financial_year,
      first_instalment,
      second_instalment,
      interest_amount,
      grant_type,
    });

    // Create an audit log entry for the update
    await createAuditLog(
      req.user.id, // User ID
      "update", // Action type
      "FinancialSummaryReport", // Table name
      ulbIdInt, // Record ID (ulb_id)
      req.body // Changed data
    );

    logger.info(
      `Financial summary report updated successfully for ULB ID: ${ulbIdInt}`
    );

    res.status(200).json({
      status: true,
      message: "Financial summary updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    logger.error(`Error updating financial summary report: ${error.message}`);
    if (error.code === "P2025") {
      res.status(404).json({
        status: false,
        message: "Financial summary report not found",
        error: error.message,
      });
    } else {
      res.status(500).json({
        status: false,
        message: "Failed to update financial summary report",
        error: error.message,
      });
    }
  }
};

module.exports = {
  getFinancialSummaryReport,
  updateFinancialSummaryReport,
};