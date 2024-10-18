const { PrismaClient } = require("@prisma/client");
const logger = require("../../../utils/log/logger");

const prisma = new PrismaClient();

/**
 * fetchFinancialSummaryReport
 *
 * This function generates and executes an SQL query to retrieve financial summary data for ULBs (Urban Local Bodies),
 * based on various filters such as city type, grant type, sector, and financial year. The data is fetched from
 * the "Scheme_info" and "FinancialSummaryReport" tables and joined with the "ULB" table to provide the necessary information.
 *
 * Each field in the SELECT statement is explained below:
 *
 * - ulb.id AS ulb_id: Fetches the unique identifier (id) for the ULB from the "ULB" table.
 * - ulb.ulb_name: Fetches the name of the ULB from the "ULB" table.
 *
 * - COUNT(s.scheme_name) AS approved_schemes: Counts the total number of approved schemes associated with the ULB from the "Scheme_info" table.
 *
 * - SUM(s.project_cost) AS fund_release_to_ulbs: Sums the total project cost for all schemes associated with the ULB,
 *   representing the total funds released to ULBs.
 *
 * - SUM(s.approved_project_cost) AS amount: Sums the approved project cost for all schemes, providing the total approved budget for the ULB's schemes.
 *
 * - SUM(CASE WHEN s.project_completion_status = 'yes' THEN 1 ELSE 0 END) AS project_completed:
 *   Counts the number of schemes that have been marked as completed (where "project_completion_status" is 'yes').
 *
 * - SUM(s.financial_progress) AS expenditure: Sums the financial progress made on each scheme, representing the total expenditure.
 *
 * - SUM(s.project_cost - s.financial_progress) AS balance_amount: Calculates the remaining balance by subtracting the financial progress (expenditure)
 *   from the project cost for each scheme, and then sums up the balance across all schemes.
 *
 * - AVG(s.financial_progress_in_percentage) AS financial_progress_in_percentage: Averages the financial progress percentage
 *   across all schemes to provide an overall progress metric in percentage.
 *
 * - SUM(CASE WHEN s.tender_floated = 'yes' THEN 1 ELSE 0 END) AS number_of_tender_floated:
 *   Counts the number of schemes for which tenders have been floated (where "tender_floated" is 'yes').
 *
 * - SUM(CASE WHEN s.tender_floated = 'no' THEN 1 ELSE 0 END) AS tender_not_floated:
 *   Counts the number of schemes for which tenders have not been floated (where "tender_floated" is 'no').
 *
 * - (COUNT(s.scheme_name) - SUM(CASE WHEN s.project_completion_status = 'yes' THEN 1 ELSE 0 END)) AS work_in_progress:
 *   Calculates the number of schemes that are still in progress by subtracting the number of completed schemes from the total number of schemes.
 *
 * - f.financial_year: Retrieves the financial year from the "FinancialSummaryReport" table, which may provide context for the report.
 *
 * - f.fr_first_instalment: Retrieves the amount of the first installment of funds released to ULBs from the "FinancialSummaryReport" table.
 *
 * - f.fr_second_instalment: Retrieves the amount of the second installment of funds released to ULBs from the "FinancialSummaryReport" table.
 *
 * - f.fr_interest_amount: Retrieves any interest earned on the released funds from the "FinancialSummaryReport" table.
 *
 * - f.fr_grant_type: Retrieves the type of grant associated with the financial summary from the "FinancialSummaryReport" table.
 *
 * - (COALESCE(f.fr_first_instalment, 0) + COALESCE(f.fr_second_instalment, 0) + COALESCE(f.fr_interest_amount, 0)) AS not_allocated_fund:
 *   This field calculates the "not allocated fund," which includes the amounts from the first and second installments, and interest amounts (if available).
 *
 * The query also allows filtering based on the following optional parameters:
 *
 * - city_type: Filters the results to include only schemes associated with a specific city type.
 * - grant_type: Filters the results to include only schemes with a specific grant type.
 * - sector: Filters the results to include only schemes from a specific sector.
 * - financial_year: Filters the results to include only schemes approved in a specific financial year.
 *
 * The query groups the data by ULB (ulb.id, ulb.ulb_name) and by financial year and grant details to provide summarized
 * information for each ULB.
 */
const fetchFinancialSummaryReport = async (
  city_type,
  grant_type,
  sector,
  financial_year
) => {
  let query = `
    SELECT 
      ulb.id AS ulb_id,
      ulb.ulb_name,
      COUNT(s.scheme_name) AS approved_schemes,
      SUM(s.project_cost) AS fund_release_to_ulbs,
      SUM(s.approved_project_cost) AS amount,
      SUM(CASE WHEN s.project_completion_status = 'yes' THEN 1 ELSE 0 END) AS project_completed,
      SUM(s.financial_progress) AS expenditure,
      SUM(s.project_cost) - SUM(s.financial_progress) AS balance_amount,
      AVG(s.financial_progress_in_percentage) AS financial_progress_in_percentage,
      SUM(CASE WHEN s.tender_floated = 'yes' THEN 1 ELSE 0 END) AS number_of_tender_floated,
      SUM(CASE WHEN s.tender_floated = 'no' THEN 1 ELSE 0 END) AS tender_not_floated,
      (COUNT(s.scheme_name) - SUM(CASE WHEN s.project_completion_status = 'yes' THEN 1 ELSE 0 END)) AS work_in_progress,
      COUNT(CASE WHEN s.financial_progress = 0 THEN 1 ELSE NULL END) AS project_not_started,
      f.financial_year,
      f.fr_first_instalment,
      f.fr_second_instalment,
      f.fr_third_instalment,
      f.fr_interest_amount,
      f.fr_grant_type,
      f.date_of_release,
      (
        COALESCE(f.fr_first_instalment, 0) +
        COALESCE(f.fr_second_instalment, 0) +
        COALESCE(f.fr_third_instalment, 0) +
        COALESCE(f.fr_interest_amount, 0)
      ) AS total_fund_released
    FROM "Scheme_info" s
    JOIN "ULB" ulb ON s.ulb = ulb.ulb_name
    LEFT JOIN "FinancialSummaryReport" f ON ulb.id = f.ulb_id
    WHERE 1=1
  `;

  // Apply filters to the query based on provided parameters
  if (city_type) {
    query += ` AND s.city_type = '${city_type}'`;
  }
  if (grant_type) {
    query += ` AND s.grant_type = '${grant_type}'`;
  }
  if (sector) {
    query += ` AND s.sector = '${sector}'`;
  }
  if (financial_year) {
    query += ` AND EXTRACT(YEAR FROM s.date_of_approval) = ${financial_year}`;
  }

  query += `
      GROUP BY ulb.id, ulb.ulb_name, f.financial_year, f.fr_first_instalment, f.fr_second_instalment, f.fr_third_instalment, f.fr_interest_amount, f.fr_grant_type, f.date_of_release
      ORDER BY ulb.id ASC
  `;

  const result = await prisma.$queryRawUnsafe(query);

  // Log calculated results
  result.forEach((ulbData) => {
    logger.info(`Detailed Financial Summary for ULB: ${ulbData.ulb_name} (ID: ${ulbData.ulb_id})

    - **Total Approved Schemes:** ${ulbData.approved_schemes} approved schemes under the ULB.
    - **Fund Released to ULBs (Total Project Costs):** ₹${ulbData.fund_release_to_ulbs} worth of project costs released to ULBs.
    - **Approved Project Costs (Budget):** ₹${ulbData.amount} total approved budget for schemes.
    - **Completed Projects:** ${ulbData.project_completed} projects completed out of total approved.
    - **Expenditure (Financial Progress):** ₹${ulbData.expenditure} total expenditure made so far across all schemes.
    - **Remaining Balance (Unspent Budget):** ₹${ulbData.balance_amount} remaining balance, calculated as (project cost - expenditure).
    - **Average Financial Progress:** ${ulbData.financial_progress_in_percentage}% financial progress across all projects.
    - **Number of Tenders Floated:** ${ulbData.number_of_tender_floated} tenders floated for ongoing schemes.
    - **Number of Tenders Not Floated:** ${ulbData.tender_not_floated} schemes have yet to float tenders.
    - **Work in Progress:** ${ulbData.work_in_progress} projects are still under progress.
    - **Projects Not Started:** ${ulbData.project_not_started} projects have not commenced yet.
    - **Total Funds released:** ₹${ulbData.total_fund_released}, including first, second, and third instalments, and interest amounts.
    - **Financial Year:** ${ulbData.financial_year}.
    - **Grant Type:** ${ulbData.fr_grant_type}.
    - **First Instalment Released:** ₹${ulbData.fr_first_instalment}.
    - **Second Instalment Released:** ₹${ulbData.fr_second_instalment}.
    - **Third Instalment Released:** ₹${ulbData.fr_third_instalment}.
    - **Interest Earned on Grants:** ₹${ulbData.fr_interest_amount} earned as interest on the released funds.
    - **Date of Release:** ${ulbData.date_of_release}.
    `);

    // Immediately follow the detailed log with a debug log for the same ULB
    logger.debug(`Calculated values for ULB ${ulbData.ulb_id}:`, {
      approved_schemes: ulbData.approved_schemes,
      fund_release_to_ulbs: ulbData.fund_release_to_ulbs,
      amount: ulbData.amount,
      project_completed: ulbData.project_completed,
      expenditure: ulbData.expenditure,
      balance_amount: ulbData.balance_amount,
      financial_progress_in_percentage:
        ulbData.financial_progress_in_percentage,
      number_of_tender_floated: ulbData.number_of_tender_floated,
      tender_not_floated: ulbData.tender_not_floated,
      work_in_progress: ulbData.work_in_progress,
      project_not_started: ulbData.project_not_started,
      total_fund_released: ulbData.total_fund_released,
      financial_year: ulbData.financial_year,
      first_instalment: ulbData.fr_first_instalment,
      second_instalment: ulbData.fr_second_instalment,
      third_instalment: ulbData.fr_third_instalment,
      interest_amount: ulbData.fr_interest_amount,
      grant_type: ulbData.fr_grant_type,
      date_of_release: ulbData.date_of_release,
    });
  });

  logger.info(
    "Detailed financial summary report data retrieved successfully.",
    { result }
  );

  return result;
};

// /**
//  * Updates the financial summary report for a given ULB.
//  * @param {Object} params - Parameters to update the financial summary.
//  * @param {number} params.ulb_id - The ULB ID to identify the record.
//  * @param {number} [params.financial_year] - The financial year (optional).
//  * @param {number} [params.first_instalment] - The first installment amount (optional).
//  * @param {number} [params.second_instalment] - The second installment amount (optional).
//  * @param {number} [params.interest_amount] - The interest amount (optional).
//  * @param {string} [params.grant_type] - The grant type (optional).
//  * @returns {Promise<Object>} - The updated financial summary report.
//  */
// const updateFinancialSummary = async ({
//   ulb_id,
//   financial_year,
//   fr_first_instalment,
//   fr_second_instalment,
//   fr_interest_amount,
//   fr_grant_type,
//   project_not_started, // New parameter
// }) => {
//   try {
//     // Log the input parameters for updating
//     logger.info("Updating financial summary with parameters:", {
//       ulb_id,
//       financial_year,
//       fr_first_instalment,
//       fr_second_instalment,
//       fr_interest_amount,
//       fr_grant_type,
//       project_not_started,
//     });

//     // Fetch the current expenditure for calculating not_allocated_fund
//     const currentSummary = await prisma.financialSummaryReport.findUnique({
//       where: { ulb_id },
//       select: {
//         expenditure: true,
//       },
//     });

//     const expenditure = currentSummary?.expenditure || 0;

//     // Log current expenditure
//     logger.debug(`Current expenditure for ULB ID ${ulb_id}: ${expenditure}`);

//     // Calculate not_allocated_fund
//     const not_allocated_fund =
//       (fr_first_instalment || 0) +
//       (fr_second_instalment || 0) +
//       (fr_interest_amount || 0);

//     // Log the calculation of not_allocated_fund
//     logger.debug(
//       `Calculated not_allocated_fund for ULB ID ${ulb_id}: ${not_allocated_fund}`
//     );

//     // Update the financial summary report in the database
//     const updatedReport = await prisma.financialSummaryReport.update({
//       where: { ulb_id }, // Identify by ULB ID
//       data: {
//         financial_year: financial_year || null,
//         fr_first_instalment: fr_first_instalment || null,
//         fr_second_instalment: fr_second_instalment || null,
//         fr_interest_amount: fr_interest_amount || null,
//         fr_grant_type: fr_grant_type || null,
//         not_allocated_fund: not_allocated_fund, // Add this field
//         updated_at: new Date(), // Set the updated_at field
//         project_not_started: project_not_started || null, // New field
//       },
//     });

//     // Log the updated report
//     logger.info("Updated financial summary report:", { updatedReport });

//     return updatedReport;
//   } catch (error) {
//     logger.error("Error in updateFinancialSummaryDao:", error);
//     throw error; // Propagate the error to be handled in the controller
//   }
// };

// /**
//  * Fetches the updated financial summary report for a given ULB ID.
//  * Only returns records where any of the fields have been updated (not null).
//  * @param {number|string} ulb_id - The ULB ID to fetch the report.
//  * @returns {Promise<Object[]>} - The list of updated financial summary reports.
//  */
// const fetchUpdatedFinancialSummary = async (req, res) => {
//   const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP
//   const userId = req.body?.auth?.id || null; // Get user ID from request

//   // Retrieve ulb_id and ulb_name from query parameters
//   const { ulb_id, ulb_name } = req.query;

//   try {
//     // Ensure at least one filter is present
//     if (!ulb_id && !ulb_name) {
//       return res.status(400).json({
//         status: false,
//         message: "Either ulb_id or ulb_name is required",
//         data: [],
//       });
//     }

//     // Log request details
//     logger.info("Fetching updated financial summary reports...", {
//       userId,
//       action: "FETCH_UPDATED_FINANCIAL_SUMMARY_REPORT",
//       ip: clientIp,
//       ulb_id,
//       ulb_name,
//     });

//     // Fetch updated financial summary reports from DAO
//     const reports = await prisma.financialSummaryReport.findMany({
//       where: {
//         OR: [
//           { ulb_id: ulb_id ? parseInt(ulb_id, 10) : undefined },
//           {
//             ulb_name: ulb_name
//               ? { contains: ulb_name, mode: "insensitive" }
//               : undefined,
//           },
//         ],
//       },
//     });

//     // Handle case where no reports are found
//     if (!reports || reports.length === 0) {
//       logger.warn("No updated financial summary reports found.", {
//         userId,
//         action: "FETCH_UPDATED_FINANCIAL_SUMMARY_REPORT",
//         ip: clientIp,
//         ulb_id,
//         ulb_name,
//       });
//       return res.status(200).json({
//         status: true,
//         message: "No updated financial summary reports found",
//         data: [],
//       });
//     }

//     // Log success and format the response
//     logger.info("Updated financial summary reports fetched successfully.", {
//       userId,
//       action: "FETCH_UPDATED_FINANCIAL_SUMMARY_REPORT",
//       ip: clientIp,
//       reportCount: reports.length,
//     });

//     // Return the formatted response with correct calculations
//     res.status(200).json({
//       status: true,
//       message: "Updated financial summary reports fetched successfully",
//       data: reports.map((report) => ({
//         ...report,
//         not_allocated_fund: (
//           (report.fr_first_instalment || 0) +
//           (report.fr_second_instalment || 0) +
//           (report.fr_interest_amount || 0)
//         ).toFixed(2),
//       })), // Add calculated field
//     });
//   } catch (error) {
//     // Log error and send error response
//     logger.error(
//       `Error fetching updated financial summary reports: ${error.message}`,
//       {
//         userId,
//         action: "FETCH_UPDATED_FINANCIAL_SUMMARY_REPORT",
//         ip: clientIp,
//         error: error.message,
//       }
//     );
//     res.status(500).json({
//       status: false,
//       message: "Failed to fetch updated financial summary reports",
//       error: error.message,
//     });
//   }
// };
module.exports = {
  fetchFinancialSummaryReport,
  // updateFinancialSummary,
  // fetchUpdatedFinancialSummary,
};
