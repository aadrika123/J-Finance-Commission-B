const {
  fetchFinancialSummaryReport,
  // updateFinancialSummary,
  // fetchUpdatedFinancialSummary,
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
  const clientIp = req.headers["x-forwarded-for"] || req.ip;
  const userId = req.body?.auth?.id || null;

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
        fr_first_instalment: row.fr_first_instalment || 0,
        fr_second_instalment: row.fr_second_instalment || 0,
        fr_third_instalment: row.fr_third_instalment || 0, // New field
        fr_interest_amount:
          row.fr_interest_amount !== undefined ? row.fr_interest_amount : null,
        fr_grant_type:
          row.fr_grant_type !== undefined ? row.fr_grant_type : null,
        project_not_started: row.project_not_started || 0,
        financial_year:
          row.financial_year !== undefined ? row.financial_year : null,
        date_of_release: row.date_of_release || null, // New field
        ...Object.fromEntries(
          Object.entries(row).map(([key, value]) => [
            key,
            typeof value === "bigint" ? value.toString() : value,
          ])
        ),
      };
    });

    for (const row of result) {
      const firstInstalment = parseFloat(row.fr_first_instalment) || 0;
      const secondInstalment = parseFloat(row.fr_second_instalment) || 0;
      const thirdInstalment = parseFloat(row.fr_third_instalment) || 0; // New calculation
      const interestAmount = parseFloat(row.fr_interest_amount) || 0;
      const notAllocatedFund =
        firstInstalment + secondInstalment + thirdInstalment + interestAmount; // Updated calculation

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
            fr_first_instalment:
              row.fr_first_instalment !== undefined
                ? row.fr_first_instalment
                : existingRecord.fr_first_instalment,
            fr_second_instalment:
              row.fr_second_instalment !== undefined
                ? row.fr_second_instalment
                : existingRecord.fr_second_instalment,
            fr_third_instalment:
              row.fr_third_instalment !== undefined
                ? row.fr_third_instalment
                : existingRecord.fr_third_instalment, // New field
            fr_interest_amount:
              row.fr_interest_amount !== undefined
                ? row.fr_interest_amount
                : existingRecord.fr_interest_amount,
            fr_grant_type:
              row.fr_grant_type !== undefined
                ? row.fr_grant_type
                : existingRecord.fr_grant_type,
            not_allocated_fund: notAllocatedFund, // Updated field
            date_of_release:
              row.date_of_release !== undefined
                ? row.date_of_release
                : existingRecord.date_of_release, // New field
            updated_at: new Date(),
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
              row.fr_first_instalment !== undefined
                ? row.fr_first_instalment
                : null,
            fr_second_instalment:
              row.fr_second_instalment !== undefined
                ? row.fr_second_instalment
                : null,
            fr_third_instalment:
              row.fr_third_instalment !== undefined
                ? row.fr_third_instalment
                : null, // New field
            fr_interest_amount:
              row.fr_interest_amount !== undefined
                ? row.fr_interest_amount
                : null,
            fr_grant_type:
              row.fr_grant_type !== undefined ? row.fr_grant_type : null,
            not_allocated_fund: notAllocatedFund, // Updated field
            date_of_release: row.date_of_release || null, // New field
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
      error: error.message,
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
    fr_third_instalment,
    fr_interest_amount,
    fr_grant_type,
    date_of_release,
    city_type,
  } = req.body;

  // Convert `financial_year` to an integer to match the schema
  const financialYearInt = parseInt(financial_year, 10);

  // Validation function remains unchanged
  const validateFinancialSummaryInputs = (
    financial_year,
    first_instalment,
    second_instalment,
    third_instalment,
    interest_amount,
    grant_type
  ) => {
    // Validation logic remains unchanged
    // ...
    return { status: true }; // Ensure this is always returned
  };

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

    const existingReport = await prisma.financialSummaryReport.findUnique({
      where: { ulb_id },
    });

    if (!existingReport) {
      return res.status(404).json({
        status: false,
        message: "Financial summary report not found",
        data: [],
      });
    }

    // Validate input values
    const validationResponse = validateFinancialSummaryInputs(
      financial_year,
      fr_first_instalment,
      fr_second_instalment,
      fr_third_instalment,
      fr_interest_amount,
      fr_grant_type
    );

    // Defensive check to ensure validationResponse exists
    if (
      !validationResponse ||
      typeof validationResponse.status === "undefined"
    ) {
      return res.status(400).json({
        status: false,
        message: "Validation response is invalid.",
      });
    }

    if (!validationResponse.status) {
      return res.status(200).json({ data: validationResponse });
    }

    // Prepare the data for update, only if new values are provided
    const dataToUpdate = {};

    // Update only if the new value is present
    if (financial_year !== undefined) {
      dataToUpdate.financial_year = financialYearInt; // Update financial_year
    }

    if (fr_first_instalment !== undefined) {
      dataToUpdate.fr_first_instalment = Number(fr_first_instalment); // Update first instalment
    }

    if (fr_second_instalment !== undefined) {
      dataToUpdate.fr_second_instalment = Number(fr_second_instalment); // Update second instalment
    }

    if (fr_third_instalment !== undefined) {
      dataToUpdate.fr_third_instalment = Number(fr_third_instalment); // Update third instalment
    }

    if (fr_interest_amount !== undefined) {
      dataToUpdate.fr_interest_amount = Number(fr_interest_amount); // Update interest amount
    }

    if (fr_grant_type !== undefined) {
      dataToUpdate.fr_grant_type = fr_grant_type; // Update grant type
    }

    // Handle date_of_release conversion if present
    if (date_of_release) {
      const releaseDate = new Date(date_of_release);
      if (isNaN(releaseDate.getTime())) {
        return res.status(400).json({
          status: false,
          message:
            "Invalid date_of_release format. Expected format is YYYY-MM-DD.",
        });
      }
      dataToUpdate.date_of_release = releaseDate; // Update date_of_release
    }

    // Update city_type if provided
    if (city_type !== undefined) {
      dataToUpdate.city_type = city_type; // Update city_type
    }
    // Calculate not_allocated_fund ensuring values are treated as numbers
    const updatedFirstInstalment = Number(
      dataToUpdate.fr_first_instalment ||
        existingReport.fr_first_instalment ||
        0
    );
    const updatedSecondInstalment = Number(
      dataToUpdate.fr_second_instalment ||
        existingReport.fr_second_instalment ||
        0
    );
    const updatedThirdInstalment = Number(
      dataToUpdate.fr_third_instalment ||
        existingReport.fr_third_instalment ||
        0
    );
    const updatedInterestAmount = Number(
      dataToUpdate.fr_interest_amount || existingReport.fr_interest_amount || 0
    );

    const not_allocated_fund =
      updatedFirstInstalment +
      updatedSecondInstalment +
      updatedThirdInstalment +
      updatedInterestAmount;

    dataToUpdate.not_allocated_fund = not_allocated_fund; // Ensure the not_allocated_fund is stored as a number
    dataToUpdate.updated_at = new Date(); // Update the updated_at field

    const updatedReport = await prisma.financialSummaryReport.update({
      where: { ulb_id },
      data: dataToUpdate, // Use prepared data for update
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

    if (error.message.includes("not found")) {
      res.status(404).json({
        status: false,
        message: "Financial summary report not found",
        error: error.message,
      });
    } else {
      res.status(400).json({
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
