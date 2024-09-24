const { PrismaClient } = require("@prisma/client");
const logger = require("../../../utils/log/logger");

const prisma = new PrismaClient();

/**
 * Fetches the financial summary report based on various filters.
 * @param {string} city_type - The type of city (e.g., 'Million Plus', 'Non Million Plus').
 * @param {string} grant_type - The type of grant (e.g., 'ambient', 'tied', 'untied').
 * @param {string} sector - The sector for filtering.
 * @param {number} financial_year - The financial year for filtering.
 * @returns {Promise<Object[]>} - The financial summary report.
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
      SUM(s.project_cost - s.financial_progress) AS balance_amount,
      AVG(s.financial_progress_in_percentage) AS financial_progress_in_percentage,
      SUM(CASE WHEN s.tender_floated = 'yes' THEN 1 ELSE 0 END) AS number_of_tender_floated,
      SUM(CASE WHEN s.tender_floated = 'no' THEN 1 ELSE 0 END) AS tender_not_floated,
      (COUNT(s.scheme_name) - SUM(CASE WHEN s.project_completion_status = 'yes' THEN 1 ELSE 0 END)) AS work_in_progress,
      f.financial_year,
      f.first_instalment,
      f.second_instalment,
      f.interest_amount,
      f.grant_type,
      (SUM(s.project_cost) - SUM(s.financial_progress) + 
        COALESCE(f.first_instalment, 0) + 
        COALESCE(f.second_instalment, 0)) AS not_allocated_fund
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

  query += ` GROUP BY ulb.id, ulb.ulb_name, f.financial_year, f.first_instalment, f.second_instalment, f.interest_amount, f.grant_type ORDER BY ulb.id ASC`;

  const result = await prisma.$queryRawUnsafe(query);
  // Log calculated results
  logger.info("Fetched financial summary report data:", { result });

  // Optionally log calculated fields
  result.forEach((item) => {
    logger.debug(`Calculated values for ULB ${item.ulb_id}:`, {
      approved_schemes: item.approved_schemes,
      fund_release_to_ulbs: item.fund_release_to_ulbs,
      amount: item.amount,
      project_completed: item.project_completed,
      expenditure: item.expenditure,
      balance_amount: item.balance_amount,
      financial_progress_in_percentage: item.financial_progress_in_percentage,
      number_of_tender_floated: item.number_of_tender_floated,
      tender_not_floated: item.tender_not_floated,
      work_in_progress: item.work_in_progress,
      not_allocated_fund: item.not_allocated_fund,
      financial_year: item.financial_year,
      first_instalment: item.first_instalment,
      second_instalment: item.second_instalment,
      interest_amount: item.interest_amount,
      grant_type: item.grant_type,
    });
  });

  return result;
};

/**
 * Updates the financial summary report for a given ULB.
 * @param {Object} params - Parameters to update the financial summary.
 * @param {number} params.ulb_id - The ULB ID to identify the record.
 * @param {number} [params.financial_year] - The financial year (optional).
 * @param {number} [params.first_instalment] - The first installment amount (optional).
 * @param {number} [params.second_instalment] - The second installment amount (optional).
 * @param {number} [params.interest_amount] - The interest amount (optional).
 * @param {string} [params.grant_type] - The grant type (optional).
 * @returns {Promise<Object>} - The updated financial summary report.
 */
const updateFinancialSummary = async ({
  ulb_id,
  financial_year,
  first_instalment,
  second_instalment,
  interest_amount,
  grant_type,
}) => {
  try {
    // Log the input parameters for updating
    logger.info("Updating financial summary with parameters:", {
      ulb_id,
      financial_year,
      first_instalment,
      second_instalment,
      interest_amount,
      grant_type,
    });

    // Fetch the current expenditure for calculating not_allocated_fund
    const currentSummary = await prisma.financialSummaryReport.findUnique({
      where: { ulb_id },
      select: {
        expenditure: true,
      },
    });

    const expenditure = currentSummary?.expenditure || 0;

    // Log current expenditure
    logger.debug(`Current expenditure for ULB ID ${ulb_id}: ${expenditure}`);

    // Calculate not_allocated_fund
    const not_allocated_fund =
      (currentSummary?.fund_release_to_ulbs || 0) -
      expenditure +
      (first_instalment || 0) +
      (second_instalment || 0);

    // Log the calculation of not_allocated_fund
    logger.debug(
      `Calculated not_allocated_fund for ULB ID ${ulb_id}: ${not_allocated_fund}`
    );

    // Update the financial summary report in the database
    const updatedReport = await prisma.financialSummaryReport.update({
      where: { ulb_id }, // Identify by ULB ID
      data: {
        financial_year: financial_year || null,
        first_instalment: first_instalment || null,
        second_instalment: second_instalment || null,
        interest_amount: interest_amount || null,
        grant_type: grant_type || null,
        not_allocated_fund, // Add this field
      },
    });

    // Log the updated report
    logger.info("Updated financial summary report:", { updatedReport });

    return updatedReport;
  } catch (error) {
    logger.error("Error in updateFinancialSummaryDao:", error);
    throw error; // Propagate the error to be handled in the controller
  }
};

/**
 * Fetches the updated financial summary report for a given ULB ID.
 * Only returns records where any of the fields have been updated (not null).
 * @param {number|string} ulb_id - The ULB ID to fetch the report.
 * @returns {Promise<Object[]>} - The list of updated financial summary reports.
 */
const fetchUpdatedFinancialSummary = async (filters) => {
  try {
    const { ulb_id, ulb_name } = filters;

    // Build the where clause
    const whereConditions = {
      AND: [],
    };

    if (ulb_id && !isNaN(ulb_id)) {
      whereConditions.AND.push({ ulb_id: parseInt(ulb_id, 10) });
    }

    if (ulb_name) {
      whereConditions.AND.push({
        ulb_name: { contains: ulb_name, mode: "insensitive" },
      });
    }

    // Ensure at least one filter is provided
    if (whereConditions.AND.length === 0) {
      throw new Error("At least ulb_id or ulb_name must be provided.");
    }

    // Fetch records based on the constructed conditions
    const reports = await prisma.financialSummaryReport.findMany({
      where: {
        ...whereConditions,
        OR: [
          { financial_year: { not: null } },
          { first_instalment: { not: null } },
          { second_instalment: { not: null } },
          { interest_amount: { not: null } },
          { grant_type: { not: null } },
        ],
      },
      select: {
        ulb_id: true,
        financial_year: true,
        first_instalment: true,
        second_instalment: true,
        interest_amount: true,
        grant_type: true,
        fund_release_to_ulbs: true,
        expenditure: true,
      },
    });

    // Calculate not_allocated_fund for each report
    const updatedReports = reports.map((report) => {
      const { fund_release_to_ulbs = 0, expenditure = 0 } = report;
      const not_allocated_fund =
        fund_release_to_ulbs -
        expenditure +
        (report.first_instalment || 0) +
        (report.second_instalment || 0);

      return {
        ...report,
        not_allocated_fund,
      };
    });

    return updatedReports;
  } catch (error) {
    logger.error("Error fetching updated financial summaries:", error);
    throw error;
  }
};

module.exports = {
  fetchFinancialSummaryReport,
  updateFinancialSummary,
  fetchUpdatedFinancialSummary,
};
