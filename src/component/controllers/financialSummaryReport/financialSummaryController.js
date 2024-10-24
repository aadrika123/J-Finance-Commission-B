const {
  fetchFinancialSummaryReport,
  findFundReleaseByUlbIdAndYear,
  upsertFundReleaseDao,
  getFundReleaseDataDao,
} = require("../../dao/financialSummaryReport/financialSummaryDao");
const { PrismaClient } = require("@prisma/client");
const logger = require("../../../utils/log/logger");
const createAuditLog = require("../../../utils/auditLog/auditLogger");
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

    // Fetch totals for tied, untied, and ambient grants separately
    const tiedTotal = await fetchFinancialSummaryReport(
      city_type,
      "tied",
      sector,
      financial_year
    );
    const untiedTotal = await fetchFinancialSummaryReport(
      city_type,
      "untied",
      sector,
      financial_year
    );
    const ambientTotal = await fetchFinancialSummaryReport(
      city_type,
      "ambient",
      sector,
      financial_year
    );

    // Calculate totals for each category
    const calculateTotals = (reportData) =>
      reportData.reduce(
        (acc, row) => {
          acc.totalApprovedSchemes += parseFloat(row.approved_schemes || 0);
          acc.totalFundReleaseToULBs += parseFloat(
            row.fund_release_to_ulbs || 0
          );
          acc.totalAmount += parseFloat(row.amount || 0);
          acc.totalProjectCompleted += parseFloat(row.project_completed || 0);
          acc.totalExpenditure += parseFloat(row.expenditure || 0);
          acc.totalBalanceAmount += parseFloat(row.balance_amount || 0);
          acc.totalFinancialProgress += parseFloat(
            row.financial_progress_in_percentage || 0
          );
          acc.totalNumberOfTenderFloated += parseFloat(
            row.number_of_tender_floated || 0
          );
          acc.totalTenderNotFloated += parseFloat(row.tender_not_floated || 0);
          acc.totalWorkInProgress += parseFloat(row.work_in_progress || 0);
          acc.totalProjectNotStarted += parseFloat(
            row.project_not_started || 0
          );

          return acc;
        },
        {
          totalApprovedSchemes: 0,
          totalFundReleaseToULBs: 0,
          totalAmount: 0,
          totalProjectCompleted: 0,
          totalExpenditure: 0,
          totalBalanceAmount: 0,
          totalFinancialProgress: 0,
          totalNumberOfTenderFloated: 0,
          totalTenderNotFloated: 0,
          totalWorkInProgress: 0,
          totalProjectNotStarted: 0,
        }
      );

    const totals = calculateTotals(report);
    const tiedTotals = calculateTotals(tiedTotal);
    const untiedTotals = calculateTotals(untiedTotal);
    const ambientTotals = calculateTotals(ambientTotal);

    // Handle BigInt serialization by converting to string
    const result = report.map((row) => {
      return {
        ...row,
        project_not_started: row.project_not_started || 0,
        ...Object.fromEntries(
          Object.entries(row).map(([key, value]) => [
            key,
            typeof value === "bigint" ? value.toString() : value, // Convert BigInt to string
          ])
        ),
      };
    });

    // Upsert into the database
    const upsertPromises = result.map(async (row) => {
      return prisma.financialSummaryReport.upsert({
        where: {
          ulb_id: row.ulb_id, // Unique identifier
        },
        update: {
          ulb_name: row.ulb_name,
          approved_schemes: parseFloat(row.approved_schemes || 0),
          fund_release_to_ulbs: parseFloat(row.fund_release_to_ulbs || 0),
          amount: parseFloat(row.amount || 0),
          project_completed: parseFloat(row.project_completed || 0),
          expenditure: parseFloat(row.expenditure || 0),
          balance_amount: parseFloat(row.balance_amount || 0),
          financial_progress_in_percentage: parseFloat(
            row.financial_progress_in_percentage || 0
          ),
          number_of_tender_floated: parseFloat(
            row.number_of_tender_floated || 0
          ),
          tender_not_floated: parseFloat(row.tender_not_floated || 0),
          work_in_progress: parseFloat(row.work_in_progress || 0),
          project_not_started: parseFloat(row.project_not_started || 0),
          updated_at: new Date(),
        },
        create: {
          ulb_id: row.ulb_id,
          ulb_name: row.ulb_name,
          approved_schemes: parseFloat(row.approved_schemes || 0),
          fund_release_to_ulbs: parseFloat(row.fund_release_to_ulbs || 0),
          amount: parseFloat(row.amount || 0),
          project_completed: parseFloat(row.project_completed || 0),
          expenditure: parseFloat(row.expenditure || 0),
          balance_amount: parseFloat(row.balance_amount || 0),
          financial_progress_in_percentage: parseFloat(
            row.financial_progress_in_percentage || 0
          ),
          number_of_tender_floated: parseFloat(
            row.number_of_tender_floated || 0
          ),
          tender_not_floated: parseFloat(row.tender_not_floated || 0),
          work_in_progress: parseFloat(row.work_in_progress || 0),
          project_not_started: parseFloat(row.project_not_started || 0),
          created_at: new Date(),
        },
      });
    });

    // Await all upsert operations
    await Promise.all(upsertPromises);

    // Return success response with the report and totals
    return res.status(200).json({
      status: "success",
      message: "Financial summary report fetched and saved successfully.",
      data: result,
      totals: {
        overall: totals,
        tied: tiedTotals,
        untied: untiedTotals,
        ambient: ambientTotals,
      },
    });
  } catch (error) {
    logger.error("Error fetching financial summary report.", {
      userId,
      action: "FETCH_FINANCIAL_SUMMARY_REPORT",
      ip: clientIp,
      error: error.message,
    });

    return res.status(200).json({
      status: "error",
      message: "Failed to fetch financial summary report.",
      error: error.message,
    });
  }
};

// FUNCTION TO RELEASE FUND AS - FI, SI, TI, INTERSEST AMOUNT ETC..

const createFundReleaseController = async (req, res) => {
  const {
    ulb_id,
    city_type,
    fund_type,
    first_instalment,
    second_instalment,
    third_instalment,
    interest_amount,
    financial_year,
    date_of_release,
  } = req.body;

  try {
    // Validation to ensure required fields are provided
    if (!ulb_id || !financial_year || !city_type || !fund_type) {
      return res.status(200).json({
        status: false,
        message:
          "Missing required fields (ulb_id, financial_year, city_type, fund_type).",
      });
    }

    // Check if there's already a record for the ULB and financial year
    const existingFundRelease = await findFundReleaseByUlbIdAndYear(
      ulb_id,
      financial_year
    );

    let total_fund_released = 0;
    let dataToUpdate = {
      ulb_id,
      city_type,
      fund_type,
      financial_year,
      date_of_release: date_of_release ? new Date(date_of_release) : null,
    };

    if (existingFundRelease) {
      // If record exists, update only the fields that haven't been set before (are null)

      if (!existingFundRelease.first_instalment && first_instalment) {
        dataToUpdate.first_instalment = Number(first_instalment);
      } else {
        dataToUpdate.first_instalment =
          existingFundRelease.first_instalment || 0;
      }

      if (!existingFundRelease.second_instalment && second_instalment) {
        dataToUpdate.second_instalment = Number(second_instalment);
      } else {
        dataToUpdate.second_instalment =
          existingFundRelease.second_instalment || 0;
      }

      if (!existingFundRelease.third_instalment && third_instalment) {
        dataToUpdate.third_instalment = Number(third_instalment);
      } else {
        dataToUpdate.third_instalment =
          existingFundRelease.third_instalment || 0;
      }

      // Interest amount can be updated if provided, or remain unchanged
      if (interest_amount !== undefined) {
        dataToUpdate.interest_amount = Number(interest_amount);
      } else {
        dataToUpdate.interest_amount = existingFundRelease.interest_amount || 0;
      }

      // Calculate the total fund released
      total_fund_released =
        (Number(dataToUpdate.first_instalment) || 0) +
        (Number(dataToUpdate.second_instalment) || 0) +
        (Number(dataToUpdate.third_instalment) || 0) +
        (Number(dataToUpdate.interest_amount) || 0);

      dataToUpdate.total_fund_released = total_fund_released;
    } else {
      // If no existing record, create a new one
      dataToUpdate.first_instalment = Number(first_instalment) || 0;
      dataToUpdate.second_instalment = Number(second_instalment) || 0;
      dataToUpdate.third_instalment = Number(third_instalment) || 0;
      dataToUpdate.interest_amount = Number(interest_amount) || 0;

      total_fund_released =
        (Number(dataToUpdate.first_instalment) || 0) +
        (Number(dataToUpdate.second_instalment) || 0) +
        (Number(dataToUpdate.third_instalment) || 0) +
        (Number(dataToUpdate.interest_amount) || 0);

      dataToUpdate.total_fund_released = total_fund_released;
    }

    // Call DAO to insert or update the data
    const upsertedFundRelease = await upsertFundReleaseDao(
      ulb_id,
      financial_year,
      dataToUpdate
    );

    // Create an audit log entry
    await createAuditLog(
      req.body?.auth?.id, // userId, assuming auth data in req.body
      existingFundRelease ? "UPDATE" : "CREATE", // actionType: "UPDATE" if existing record, else "CREATE"
      "FundRelease", // tableName
      ulb_id, // recordId (ulb_id as the identifier)
      dataToUpdate // changedData: the updated or created data
    );

    // Send response back with the updated/created fund release
    return res.status(200).json({
      status: true,
      message: "Fund release upserted successfully.",
      data: upsertedFundRelease,
    });
  } catch (error) {
    logger.error("Error upserting fund release:", error);
    return res.status(200).json({
      status: false,
      message: `Failed to upsert fund release: ${error.message}`,
    });
  }
};

const getFundReleaseReport = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip;
  const userId = req.body?.auth?.id || null;

  try {
    logger.info("Fetching fund release report...", {
      userId,
      action: "FETCH_FUND_RELEASE_REPORT",
      ip: clientIp,
      query: req.query,
    });

    const { financial_year, city_type, fund_type } = req.query;

    // Call DAO function to fetch fund release data with filters
    const report = await getFundReleaseDataDao(
      financial_year,
      city_type,
      fund_type
    );

    if (!report.length) {
      return res.status(200).json({
        status: "error",
        message: "No fund release report found for the given criteria.",
      });
    }

    // Calculate totals for all rows
    const totals = report.reduce(
      (acc, row) => {
        acc.totalFirstInstalment += parseFloat(row.first_instalment || 0);
        acc.totalSecondInstalment += parseFloat(row.second_instalment || 0);
        acc.totalThirdInstalment += parseFloat(row.third_instalment || 0);
        acc.totalInterestAmount += parseFloat(row.interest_amount || 0);
        acc.totalFundReleased += parseFloat(row.total_fund_released || 0);
        return acc;
      },
      {
        totalFirstInstalment: 0,
        totalSecondInstalment: 0,
        totalThirdInstalment: 0,
        totalInterestAmount: 0,
        totalFundReleased: 0,
      }
    );

    logger.info("Fund release report fetched successfully.", {
      userId,
      action: "FETCH_FUND_RELEASE_REPORT",
      ip: clientIp,
      reportSummary: report.length,
    });

    return res.status(200).json({
      status: "success",
      message: "Fund release report fetched successfully.",
      data: report,
      totals: {
        totalFirstInstalment: totals.totalFirstInstalment.toFixed(2),
        totalSecondInstalment: totals.totalSecondInstalment.toFixed(2),
        totalThirdInstalment: totals.totalThirdInstalment.toFixed(2),
        totalInterestAmount: totals.totalInterestAmount.toFixed(2),
        totalFundReleased: totals.totalFundReleased.toFixed(2),
      },
    });
  } catch (error) {
    logger.error("Error fetching fund release report.", {
      userId,
      action: "FETCH_FUND_RELEASE_REPORT",
      error: error.message,
    });
    return res.status(200).json({
      status: "error",
      message: "Failed to fetch fund release report.",
      error: error.message,
    });
  }
};
module.exports = {
  getFinancialSummaryReport,
  createFundReleaseController,
  getFundReleaseReport,
};
