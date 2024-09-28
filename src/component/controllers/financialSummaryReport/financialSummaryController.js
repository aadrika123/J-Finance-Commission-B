const {
  fetchFinancialSummaryReport,
  updateFinancialSummary,
  fetchUpdatedFinancialSummary,
} = require("../../dao/financialSummaryReport/financialSummaryDao");
const { PrismaClient } = require("@prisma/client");
const logger = require("../../../utils/log/logger");
const createAuditLog = require("../../../utils/auditLog/auditLogger"); // Import audit logger
const prisma = new PrismaClient();

/**
 *
 * developer - Kaushal Kant Mishra
 *
 * Retrieves and processes the financial summary report based on the provided query parameters.
 *
 * This function:
 * 1. Captures the client's IP address and user ID from the request for logging purposes.
 * 2. Extracts query parameters such as city_type, grant_type, sector, and financial_year to filter the report data.
 * 3. Fetches the financial summary report using the `fetchFinancialSummaryReport` function.
 * 4. Processes the fetched data to ensure compatibility with the database schema, including handling bigint values.
 * 5. Updates existing records in the database if they match the `ulb_id` or creates new records if no match is found.
 * 6. Logs actions and errors throughout the process, including audit logs for create and update operations.
 * 7. Returns a JSON response with the status and data of the processed report, or an error message if the process fails.
 *
 * @param {Object} req - The request object containing query parameters and user information.
 * @param {Object} res - The response object used to send the result back to the client.
 *
 * @returns {void} - Sends a JSON response to the client with the status and result of the operation.
 */

const getFinancialSummaryReport = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture client IP address for logging purposes
  const userId = req.body?.auth?.id || null; // Retrieve user ID from request body if available

  try {
    logger.info("Fetching financial summary report...", {
      userId,
      action: "FETCH_FINANCIAL_SUMMARY_REPORT",
      ip: clientIp,
      query: req.query, // Log the query parameters for debugging
    });

    const { city_type, grant_type, sector, financial_year } = req.query;

    // Fetch the report data using the DAO function
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
      reportSummary: report.length, // Log the number of records fetched
    });

    const result = report.map((row) => {
      return {
        ...row,
        financial_year:
          row.financial_year !== undefined ? row.financial_year : null,
        first_instalment: row.first_instalment || 0,
        second_instalment: row.second_instalment || 0,
        interest_amount:
          row.interest_amount !== undefined ? row.interest_amount : null,
        grant_type: row.grant_type !== undefined ? row.grant_type : null,
        project_not_started: row.project_not_started || 0, // Ensure inclusion
        ...Object.fromEntries(
          Object.entries(row).map(([key, value]) => [
            key,
            typeof value === "bigint" ? value.toString() : value,
          ])
        ),
      };
    });

    for (const row of result) {
      // Calculate not_allocated_fund for each row
      const firstInstalment = parseFloat(row.first_instalment) || 0;
      const secondInstalment = parseFloat(row.second_instalment) || 0;
      const interestAmount = parseFloat(row.interest_amount) || 0;
      const notAllocatedFund =
        firstInstalment + secondInstalment + interestAmount;

      const existingRecord = await prisma.financialSummaryReport.findUnique({
        where: { ulb_id: row.ulb_id },
      });

      if (existingRecord) {
        // Update the existing record
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
            fr_first_instalment:
              row.first_instalment !== undefined
                ? row.first_instalment
                : existingRecord.fr_first_instalment,
            fr_second_instalment:
              row.second_instalment !== undefined
                ? row.second_instalment
                : existingRecord.fr_second_instalment,
            fr_interest_amount:
              row.interest_amount !== undefined
                ? row.interest_amount
                : existingRecord.fr_interest_amount,
            fr_grant_type:
              row.grant_type !== undefined
                ? row.grant_type
                : existingRecord.fr_grant_type,
            not_allocated_fund: notAllocatedFund, // Updated not_allocated_fund calculation
            updated_at: new Date(), // Update the timestamp
            project_not_started:
              parseInt(row.project_not_started, 10) ||
              existingRecord.project_not_started,
          },
        });

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
        // Create a new record if it doesn't exist
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
            fr_first_instalment:
              row.first_instalment !== undefined ? row.first_instalment : null,
            fr_second_instalment:
              row.second_instalment !== undefined
                ? row.second_instalment
                : null,
            fr_interest_amount:
              row.interest_amount !== undefined ? row.interest_amount : null,
            fr_grant_type: row.grant_type !== undefined ? row.grant_type : null,
            not_allocated_fund: notAllocatedFund,
          },
        });

        await createAuditLog(
          userId,
          "CREATE",
          "FinancialSummaryReport",
          newRecord.ulb_id,
          newRecord
        );
      }
    }

    return res.status(200).json({
      status: "success",
      message: "Financial summary report fetched successfully.",
      data: result,
    });
  } catch (error) {
    logger.error("Error fetching financial summary report.", {
      userId,
      action: "FETCH_FINANCIAL_SUMMARY_REPORT",
      ip: clientIp,
      error: error.message, // Log the error message for debugging
    });

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch financial summary report.",
      error: error.message,
    });
  }
};
// module.exports = {
//   getFinancialSummaryReport,
// };
/**
 * Updates the financial summary report for a specific ULB (Urban Local Body).
 *
 * This function:
 * 1. Captures the client's IP address and user ID from the request for logging purposes.
 * 2. Extracts required fields from the request body including `ulb_id`, `financial_year`, `first_instalment`,
 *    `second_instalment`, `interest_amount`, and `grant_type`.
 * 3. Validates the presence of `ulb_id`, returning an error response if it's missing.
 * 4. Logs the update request details including the ULB ID and request data.
 * 5. Updates the financial summary report using the `updateFinancialSummary` function.
 * 6. Creates an audit log entry for the update operation.
 * 7. Logs a success message if the update is successful and returns a success response.
 * 8. Catches and handles errors, logging the error details and returning an appropriate error response.
 *
 * @param {Object} req - The request object containing the data to update.
 * @param {Object} res - The response object used to send the result back to the client.
 *
 * @returns {void} - Sends a JSON response to the client with the status and result of the update operation.
 */
const updateFinancialSummaryReport = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip;
  const userId = req.body?.auth?.id || null;

  const {
    ulb_id,
    financial_year,
    fr_first_instalment,
    fr_second_instalment,
    fr_interest_amount,
    fr_grant_type,
    project_not_started,
  } = req.body;

  try {
    if (!ulb_id) {
      logger.warn("ULB ID is missing in the request.", {
        userId,
        action: "UPDATE_FINANCIAL_SUMMARY",
        ip: clientIp,
      });

      return res.status(200).json({
        status: true,
        message: "ULB ID is required",
      });
    }

    logger.info(`Updating financial summary report for ULB ID: ${ulb_id}`, {
      userId,
      action: "UPDATE_FINANCIAL_SUMMARY",
      ip: clientIp,
      data: req.body,
    });

    const existingReport = await prisma.financialSummaryReport.findUnique({
      where: { ulb_id },
    });

    if (!existingReport) {
      return res.status(200).json({
        status: true,
        message: "Financial summary report not found",
        data: [],
      });
    }

    // Convert values to numbers (or set to null if not provided)
    const updatedFirstInstalment = Number(fr_first_instalment || 0);
    const updatedSecondInstalment = Number(fr_second_instalment || 0);
    const updatedInterestAmount = Number(fr_interest_amount || 0);
    const updatedProjectNotStarted = Number(project_not_started || 0);

    // Calculate not_allocated_fund as the sum of the first and second instalments and the interest amount
    const not_allocated_fund =
      updatedFirstInstalment + updatedSecondInstalment + updatedInterestAmount;

    // Log the calculations for debugging purposes
    console.log({
      updatedFirstInstalment,
      updatedSecondInstalment,
      updatedInterestAmount,
      not_allocated_fund,
    });

    const updatedReport = await prisma.financialSummaryReport.update({
      where: { ulb_id },
      data: {
        financial_year,
        fr_first_instalment: updatedFirstInstalment,
        fr_second_instalment: updatedSecondInstalment,
        fr_interest_amount: updatedInterestAmount,
        fr_grant_type: fr_grant_type,

        not_allocated_fund,
        project_not_started: updatedProjectNotStarted, // Updating the non-started projects count
        updated_at: new Date(), // Updating the timestamp for the last update
      },
    });

    await createAuditLog(userId, "UPDATE", "FinancialSummaryReport", ulb_id, {
      oldData: existingReport,
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

/**
 * Retrieves the updated financial summary report for a specific ULB (Urban Local Body).
 *
 * This function:
 * 1. Captures the client's IP address and user ID from the request for logging purposes.
 * 2. Extracts `ulb_id` from query parameters to identify which ULB's report to fetch.
 * 3. Logs the fetch request details including the ULB ID.
 * 4. Fetches the updated financial summary reports using the `fetchUpdatedFinancialSummary` function.
 * 5. Checks if reports are found and returns a 404 response if no reports are found.
 * 6. Logs a success message if reports are successfully fetched and returns the reports in the response.
 * 7. Catches and handles errors, logging the error details and returning an appropriate error response.
 *
 * @param {Object} req - The request object containing query parameters.
 * @param {Object} res - The response object used to send the result back to the client.
 *
 * @returns {void} - Sends a JSON response to the client with the status and data of the fetched reports.
 */
const getUpdatedFinancialSummaryReport = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP
  const userId = req.body?.auth?.id || null; // Get user ID from request

  // Retrieve ulb_id and ulb_name from query parameters
  const { ulb_id, ulb_name } = req.query;

  try {
    // Ensure at least one filter is present
    if (!ulb_id && !ulb_name) {
      return res.status(400).json({
        status: false,
        message: "Either ulb_id or ulb_name is required",
        data: [],
      });
    }

    // Log request details
    logger.info("Fetching updated financial summary reports...", {
      userId,
      action: "FETCH_UPDATED_FINANCIAL_SUMMARY_REPORT",
      ip: clientIp,
      ulb_id,
      ulb_name,
    });

    // Fetch updated financial summary report based on ulb_id or ulb_name
    const report = await prisma.financialSummaryReport.findFirst({
      where: {
        OR: [
          { ulb_id: ulb_id ? Number(ulb_id) : undefined }, // Convert to number if ulb_id is provided
          { ulb_name: ulb_name },
        ],
      },
    });

    // Handle case where no report is found
    if (!report) {
      logger.warn("No updated financial summary report found.", {
        userId,
        action: "FETCH_UPDATED_FINANCIAL_SUMMARY_REPORT",
        ip: clientIp,
        ulb_id,
        ulb_name,
      });
      return res.status(200).json({
        status: true,
        message: "No updated financial summary reports found",
        data: [],
      });
    }

    // Log success and prepare formatted report
    logger.info("Updated financial summary report fetched successfully.", {
      userId,
      action: "FETCH_UPDATED_FINANCIAL_SUMMARY_REPORT",
      ip: clientIp,
      report,
    });

    // Calculate not_allocated_fund
    const firstInstalment = parseFloat(report.fr_first_instalment) || 0;
    const secondInstalment = parseFloat(report.fr_second_instalment) || 0;
    const interestAmount = parseFloat(report.fr_interest_amount) || 0;

    const notAllocatedFund = (
      firstInstalment +
      secondInstalment +
      interestAmount
    ).toFixed(2); // Fixed to 2 decimal places

    // Prepare response
    const formattedReport = {
      ...report,
      not_allocated_fund: notAllocatedFund,
    };

    res.status(200).json({
      status: true,
      message: "Updated financial summary report fetched successfully",
      data: formattedReport,
    });
  } catch (error) {
    // Log error and send error response
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
