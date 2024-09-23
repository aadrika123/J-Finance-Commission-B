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
    // Log the initiation of the financial summary report fetching process
    logger.info("Fetching financial summary report...", {
      userId,
      action: "FETCH_FINANCIAL_SUMMARY_REPORT",
      ip: clientIp,
      query: req.query, // Log the query parameters for debugging
    });

    // Extract query parameters to use for filtering the financial summary report
    const { city_type, grant_type, sector, financial_year } = req.query;

    // Fetch the financial summary report based on provided query parameters
    const report = await fetchFinancialSummaryReport(
      city_type,
      grant_type,
      sector,
      financial_year
    );

    // Log successful fetching of the financial summary report
    logger.info("Financial summary report fetched successfully.", {
      userId,
      action: "FETCH_FINANCIAL_SUMMARY_REPORT",
      ip: clientIp,
      reportSummary: report.length, // Log the number of records fetched
    });

    // Process the report data to ensure compatibility with the database schema
    const result = report.map((row) => {
      const first_instalment = row.first_instalment || 0;
      const second_instalment = row.second_instalment || 0;
      const expenditure = row.expenditure || 0;

      return {
        ...row,
        financial_year:
          row.financial_year !== undefined ? row.financial_year : null,
        first_instalment,
        second_instalment,
        interest_amount:
          row.interest_amount !== undefined ? row.interest_amount : null,
        grant_type: row.grant_type !== undefined ? row.grant_type : null,
        not_allocated_fund: first_instalment + second_instalment - expenditure, // Calculate not_allocated_fund
        ...Object.fromEntries(
          Object.entries(row).map(([key, value]) => [
            key,
            typeof value === "bigint" ? value.toString() : value,
          ])
        ),
      };
    });

    // Iterate over each row of the processed report
    for (const row of result) {
      const existingRecord = await prisma.financialSummaryReport.findUnique({
        where: { ulb_id: row.ulb_id },
      });

      if (existingRecord) {
        // Update the existing record with new data
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
            not_allocated_fund:
              (row.first_instalment || 0) +
              (row.second_instalment || 0) -
              (existingRecord.expenditure || 0), // Update not_allocated_fund
          },
        });

        // Log the update operation in the audit log
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
        // Create a new record in the database
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
            not_allocated_fund:
              (row.first_instalment || 0) +
              (row.second_instalment || 0) -
              (row.expenditure || 0), // Calculate for new record
          },
        });

        // Log the creation operation in the audit log
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

    // Log the successful processing of the financial summary report
    logger.info("Financial summary report processed successfully.", {
      userId,
      action: "PROCESS_FINANCIAL_SUMMARY_REPORT",
      ip: clientIp,
      resultCount: result.length, // Log the number of records processed
    });

    // Respond with the results of the operation
    res.status(200).json({
      status: true,
      message: "Financial summary report fetched and stored successfully",
      data: result, // Include the processed report data in the response
    });
  } catch (error) {
    // Log the error details if the operation fails
    logger.error(`Error fetching financial summary report: ${error.message}`, {
      userId,
      action: "FETCH_FINANCIAL_SUMMARY_REPORT",
      ip: clientIp,
      error: error.message, // Include the error message for debugging
    });
    // Respond with a 500 Internal Server Error if something goes wrong
    res.status(500).json({
      status: false,
      message: "Failed to fetch and store financial summary report",
      error: error.message, // Include the error message in the response
    });
  }
};

module.exports = {
  getFinancialSummaryReport,
};

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
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP
  const userId = req.body?.auth?.id || null; // Get user ID from request

  // Extract relevant data from request body
  const {
    ulb_id,
    financial_year,
    first_instalment,
    second_instalment,
    interest_amount,
    grant_type,
  } = req.body;

  try {
    // Validate that ulb_id is provided
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

    // Log request details
    logger.info(`Updating financial summary report for ULB ID: ${ulb_id}`, {
      userId,
      action: "UPDATE_FINANCIAL_SUMMARY",
      ip: clientIp,
      data: req.body,
    });

    // Fetch existing report data to calculate not_allocated_fund
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

    // Calculate not_allocated_fund
    const updatedFirstInstalment =
      first_instalment !== undefined
        ? first_instalment
        : existingReport.first_instalment;
    const updatedSecondInstalment =
      second_instalment !== undefined
        ? second_instalment
        : existingReport.second_instalment;
    const updatedExpenditure = existingReport.expenditure || 0; // Use existing expenditure if not provided in the update

    const not_allocated_fund =
      (updatedFirstInstalment || 0) +
      (updatedSecondInstalment || 0) -
      updatedExpenditure;

    // Perform the update operation
    const updatedReport = await prisma.financialSummaryReport.update({
      where: { ulb_id },
      data: {
        financial_year,
        first_instalment: updatedFirstInstalment,
        second_instalment: updatedSecondInstalment,
        interest_amount,
        grant_type,
        not_allocated_fund, // Include the calculated field
      },
    });

    // Audit Log for the update
    await createAuditLog(userId, "UPDATE", "FinancialSummaryReport", ulb_id, {
      oldData: existingReport, // Fetch old data for detailed audit logs
      newData: updatedReport,
    });

    // Log success and send response
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
    // Log error and send error response
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

    // Fetch updated financial summary reports
    const reports = await fetchUpdatedFinancialSummary({ ulb_id, ulb_name });

    // Handle case where no reports are found
    if (!reports || reports.length === 0) {
      logger.warn("No updated financial summary reports found.", {
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

    // Process the reports if needed
    const processedReports = reports.map((report) => ({
      ...report,
      not_allocated_fund:
        report.not_allocated_fund !== undefined
          ? report.not_allocated_fund
          : null,
    }));

    // Log success and send response with fetched reports
    logger.info("Updated financial summary reports fetched successfully.", {
      userId,
      action: "FETCH_UPDATED_FINANCIAL_SUMMARY_REPORT",
      ip: clientIp,
      reportCount: processedReports.length,
    });

    res.status(200).json({
      status: true,
      message: "Updated financial summary reports fetched successfully",
      data: processedReports,
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
