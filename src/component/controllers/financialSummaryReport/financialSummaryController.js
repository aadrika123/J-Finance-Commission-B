const {
  fetchFinancialSummaryReport,
  updateFinancialSummary,
  fetchUpdatedFinancialSummary,
} = require("../../dao/financialSummaryReport/financialSummaryDao");
const { PrismaClient } = require("@prisma/client");
const logger = require("../../../utils/log/logger");
const createAuditLog = require("../../../utils/auditLog/auditLogger"); // Import audit logger
const prisma = new PrismaClient();

const getFinancialSummaryReport = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP
  const userId = req.body?.auth?.id || null; // Get user ID from request

  try {
    logger.info("Fetching financial summary report...", {
      userId,
      action: "FETCH_FINANCIAL_SUMMARY_REPORT",
      ip: clientIp,
      query: req.query,
    });

    const { city_type, grant_type, sector, financial_year } = req.query;

    const report = await fetchFinancialSummaryReport(
      city_type,
      grant_type,
      sector,
      financial_year
    );

    logger.info("Financial summary report fetched successfully.", {
      userId,
      action: "FETCH_FINANCIAL_SUMMARY_REPORT",
      ip: clientIp,
      reportSummary: report.length,
    });

    const result = report.map((row) => {
      return {
        ...row,
        financial_year:
          row.financial_year !== undefined ? row.financial_year : null,
        first_instalment:
          row.first_instalment !== undefined ? row.first_instalment : null,
        second_instalment:
          row.second_instalment !== undefined ? row.second_instalment : null,
        interest_amount:
          row.interest_amount !== undefined ? row.interest_amount : null,
        grant_type: row.grant_type !== undefined ? row.grant_type : null,
        ...Object.fromEntries(
          Object.entries(row).map(([key, value]) => [
            key,
            typeof value === "bigint" ? value.toString() : value,
          ])
        ),
      };
    });

    for (const row of result) {
      const existingRecord = await prisma.financialSummaryReport.findUnique({
        where: { ulb_id: row.ulb_id },
      });

      if (existingRecord) {
        const updatedRecord = await prisma.financialSummaryReport.update({
          where: { ulb_id: row.ulb_id },
          data: {
            ulb_name: row.ulb_name || existingRecord.ulb_name,
            approved_schemes: parseInt(row.approved_schemes, 10),
            fund_release_to_ulbs:
              parseFloat(row.fund_release_to_ulbs) ||
              existingRecord.fund_release_to_ulbs,
            amount: parseFloat(row.amount) || existingRecord.amount,
            project_completed:
              parseInt(row.project_completed, 10) ||
              existingRecord.project_completed,
            expenditure:
              parseFloat(row.expenditure) || existingRecord.expenditure,
            balance_amount:
              parseFloat(row.balance_amount) || existingRecord.balance_amount,
            financial_progress_in_percentage:
              parseInt(row.financial_progress_in_percentage, 10) ||
              existingRecord.financial_progress_in_percentage,
            number_of_tender_floated:
              parseInt(row.number_of_tender_floated, 10) ||
              existingRecord.number_of_tender_floated,
            tender_not_floated:
              parseInt(row.tender_not_floated, 10) ||
              existingRecord.tender_not_floated,
            work_in_progress:
              parseInt(row.work_in_progress, 10) ||
              existingRecord.work_in_progress,
            financial_year:
              row.financial_year !== undefined
                ? row.financial_year
                : existingRecord.financial_year,
            first_instalment:
              row.first_instalment !== undefined
                ? row.first_instalment
                : existingRecord.first_instalment,
            second_instalment:
              row.second_instalment !== undefined
                ? row.second_instalment
                : existingRecord.second_instalment,
            interest_amount:
              row.interest_amount !== undefined
                ? row.interest_amount
                : existingRecord.interest_amount,
            grant_type:
              row.grant_type !== undefined
                ? row.grant_type
                : existingRecord.grant_type,
          },
        });

        // Audit Log for Update
        await createAuditLog(
          userId,
          "UPDATE",
          "FinancialSummaryReport",
          row.ulb_id,
          {
            oldData: existingRecord,
            newData: updatedRecord,
          }
        );
      } else {
        const newRecord = await prisma.financialSummaryReport.create({
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
            financial_year:
              row.financial_year !== undefined ? row.financial_year : null,
            first_instalment:
              row.first_instalment !== undefined ? row.first_instalment : null,
            second_instalment:
              row.second_instalment !== undefined
                ? row.second_instalment
                : null,
            interest_amount:
              row.interest_amount !== undefined ? row.interest_amount : null,
            grant_type: row.grant_type !== undefined ? row.grant_type : null,
          },
        });

        // Audit Log for Create
        await createAuditLog(
          userId,
          "CREATE",
          "FinancialSummaryReport",
          row.ulb_id,
          {
            newData: newRecord,
          }
        );
      }
    }

    logger.info("Financial summary report processed successfully.", {
      userId,
      action: "PROCESS_FINANCIAL_SUMMARY_REPORT",
      ip: clientIp,
      resultCount: result.length,
    });

    res.status(200).json({
      status: true,
      message: "Financial summary report fetched and stored successfully",
      data: result,
    });
  } catch (error) {
    logger.error(`Error fetching financial summary report: ${error.message}`, {
      userId,
      action: "FETCH_FINANCIAL_SUMMARY_REPORT",
      ip: clientIp,
      error: error.message,
    });
    res.status(500).json({
      status: false,
      message: "Failed to fetch and store financial summary report",
      error: error.message,
    });
  }
};

// Update the financial summary report
const updateFinancialSummaryReport = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP
  const userId = req.body?.auth?.id || null; // Get user ID from request

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
      logger.warn("ULB ID is missing in the request.", {
        userId,
        action: "UPDATE_FINANCIAL_SUMMARY",
        ip: clientIp,
      });
      return res.status(400).json({
        status: false,
        message: "ULB ID is required",
      });
    }

    logger.info(`Updating financial summary report for ULB ID: ${ulb_id}`, {
      userId,
      action: "UPDATE_FINANCIAL_SUMMARY",
      ip: clientIp,
      data: req.body,
    });

    const updatedReport = await updateFinancialSummary({
      ulb_id,
      financial_year,
      first_instalment,
      second_instalment,
      interest_amount,
      grant_type,
    });

    // Audit Log for Update
    await createAuditLog(userId, "UPDATE", "FinancialSummaryReport", ulb_id, {
      oldData: {}, // Fetch old data if necessary
      newData: updatedReport,
    });

    logger.info(
      `Financial summary report updated successfully for ULB ID: ${ulb_id}`,
      {
        userId,
        action: "UPDATE_FINANCIAL_SUMMARY",
        ip: clientIp,
        updatedReport,
      }
    );

    res.status(200).json({
      status: true,
      message: "Financial summary updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    logger.error(
      `Error updating financial summary report with ULB ID ${ulb_id}: ${error.message}`,
      {
        userId,
        action: "UPDATE_FINANCIAL_SUMMARY",
        ip: clientIp,
        error: error.message,
      }
    );
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

// Get updated financial summary report
const getUpdatedFinancialSummaryReport = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP
  const userId = req.body?.auth?.id || null; // Get user ID from request

  const { ulb_id } = req.query; // Retrieve ulb_id from query parameters

  try {
    logger.info("Fetching updated financial summary reports...", {
      userId,
      action: "FETCH_UPDATED_FINANCIAL_SUMMARY_REPORT",
      ip: clientIp,
      ulb_id,
    });

    const reports = await fetchUpdatedFinancialSummary(ulb_id);

    if (!reports || reports.length === 0) {
      logger.warn("No updated financial summary reports found.", {
        userId,
        action: "FETCH_UPDATED_FINANCIAL_SUMMARY_REPORT",
        ip: clientIp,
        ulb_id,
      });
      return res.status(404).json({
        status: false,
        message: "No updated financial summary reports found",
      });
    }

    logger.info("Updated financial summary reports fetched successfully.", {
      userId,
      action: "FETCH_UPDATED_FINANCIAL_SUMMARY_REPORT",
      ip: clientIp,
      reportCount: reports.length,
    });

    res.status(200).json({
      status: true,
      message: "Updated financial summary reports fetched successfully",
      data: reports,
    });
  } catch (error) {
    logger.error(
      `Error fetching updated financial summary reports: ${error.message}`,
      {
        userId,
        action: "FETCH_UPDATED_FINANCIAL_SUMMARY_REPORT",
        ip: clientIp,
        error: error.message,
      }
    );
    res.status(500).json({
      status: false,
      message: "Failed to fetch updated financial summary reports",
      error: error.message,
    });
  }
};

module.exports = {
  getFinancialSummaryReport,
  updateFinancialSummaryReport,
  getUpdatedFinancialSummaryReport,
};
