const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Fetches financial summary report data for Million Plus Cities based on optional filters.
 *
 * This function:
 * 1. Constructs a SQL query to retrieve financial summary data joined with scheme info.
 * 2. Adds optional filters to the query based on the provided parameters.
 * 3. Executes the raw SQL query using Prisma's `$queryRawUnsafe` method.
 * 4. Handles and logs any errors that occur during query execution.
 *
 * @param {Object} filters - The optional filters for the query.
 * @param {string} [filters.ulb_name] - The name of the ULB to filter by.
 * @param {string} [filters.grant_type] - The grant type to filter by.
 * @param {number} [filters.financial_year] - The financial year to filter by.
 * @param {string} [filters.sector] - The sector to filter by.
 *
 * @returns {Promise<Object[]>} - Returns a promise that resolves to the query results.
 */

const fetchFinancialSummaryReportMillionPlus = async (filters) => {
  const { ulb_name, grant_type, financial_year, sector } = filters;

  // SQL query ensuring only one entry per ULB with proper grouping
  let query = `
  SELECT 
    FSR.ulb_id,
    FSR.ulb_name,
    FSR.approved_schemes AS approved_project,
    FSR.number_of_tender_floated AS tender_approved,
    FSR.amount AS approved_amount,
    FSR.expenditure,
    FSR.financial_progress_in_percentage AS financial_progress,
    FSR.project_completed,
    ARRAY_AGG(DISTINCT SI.financial_year) AS financial_years,  -- Aggregate financial years into an array
    ARRAY_AGG(DISTINCT SI.grant_type) AS grant_types,  -- Aggregate grant types into an array
    ARRAY_AGG(DISTINCT SI.sector) AS sectors,  -- Combine all sectors into an array
    SI.city_type,
    FSR.project_not_started
  FROM 
    "FinancialSummaryReport" FSR
  INNER JOIN 
    "Scheme_info" SI ON FSR.ulb_name = SI.ulb
  WHERE 
    SI.city_type = 'million plus'
`;

  const queryParams = [];
  let paramIndex = 1;

  if (ulb_name) {
    query += ` AND FSR.ulb_name = $${paramIndex}`;
    queryParams.push(ulb_name);
    paramIndex++;
  }
  if (grant_type) {
    query += ` AND SI.grant_type = $${paramIndex}`;
    queryParams.push(grant_type);
    paramIndex++;
  }
  if (financial_year) {
    query += ` AND SI.financial_year = $${paramIndex}`; // No need to parse financial_year, treat as string
    queryParams.push(financial_year);
    paramIndex++;
  }
  if (sector) {
    query += ` AND SI.sector = $${paramIndex}`;
    queryParams.push(sector);
    paramIndex++;
  }

  // Group results by ULB ID to ensure uniqueness
  query += `
  GROUP BY FSR.ulb_id, FSR.ulb_name, FSR.approved_schemes, FSR.number_of_tender_floated, 
           FSR.amount, FSR.expenditure, FSR.financial_progress_in_percentage, 
           FSR.project_completed, SI.city_type, 
           FSR.project_not_started
  ORDER BY FSR.ulb_id ASC
`;

  try {
    return await prisma.$queryRawUnsafe(query, ...queryParams);
  } catch (error) {
    console.error("Error fetching financial summary data:", error);
    throw new Error("Error fetching financial summary data");
  }
};
/**
 * Fetches financial summary report data for Non-Million Plus Cities based on optional filters.
 *
 * This function:
 * 1. Constructs a SQL query to retrieve financial summary data joined with scheme info.
 * 2. Adds optional filters to the query based on the provided parameters.
 * 3. Executes the raw SQL query using Prisma's `$queryRawUnsafe` method.
 * 4. Handles and logs any errors that occur during query execution.
 *
 * @param {Object} filters - The optional filters for the query.
 * @param {string} [filters.ulb_name] - The name of the ULB to filter by.
 * @param {string} [filters.grant_type] - The grant type to filter by.
 * @param {number} [filters.financial_year] - The financial year to filter by.
 * @param {string} [filters.sector] - The sector to filter by.
 *
 * @returns {Promise<Object[]>} - Returns a promise that resolves to the query results.
 */
const fetchFinancialSummaryReportNonMillionPlus = async (filters = {}) => {
  const { ulb_name, grant_type, financial_year, sector } = filters;

  // Updated SQL query to fetch unique ULBs with aggregated financial years, grant types, and sectors
  let query = `
    SELECT DISTINCT ON (FSR.ulb_id)
      FSR.ulb_id,
      FSR.ulb_name,
      FSR.approved_schemes AS approved_project,
      FSR.number_of_tender_floated AS tender_approved,
      FSR.amount AS approved_amount,
      FSR.expenditure,
      FSR.financial_progress_in_percentage AS financial_progress,
      FSR.project_completed,
      ARRAY_AGG(DISTINCT SI.financial_year) AS financial_years,  -- Aggregate distinct financial years into an array
      ARRAY_AGG(DISTINCT SI.grant_type) AS grant_types,  -- Aggregate distinct grant types into an array
      ARRAY_AGG(DISTINCT SI.sector) AS sectors,  -- Aggregate distinct sectors into an array
      SI.city_type,
      FSR.project_not_started
    FROM 
      "FinancialSummaryReport" FSR
    INNER JOIN 
      "Scheme_info" SI
    ON 
      FSR.ulb_name = SI.ulb
    WHERE 
      SI.city_type = 'non million'
  `;

  const queryParams = [];
  let paramIndex = 1; // Index for PostgreSQL numbered parameters

  // Add optional filters to the query
  if (ulb_name) {
    query += ` AND FSR.ulb_name = $${paramIndex}`;
    queryParams.push(ulb_name);
    paramIndex++;
  }
  if (grant_type) {
    query += ` AND SI.grant_type = $${paramIndex}`;
    queryParams.push(grant_type);
    paramIndex++;
  }
  if (financial_year) {
    query += ` AND SI.financial_year = $${paramIndex}`;
    queryParams.push(financial_year);
    paramIndex++;
  }
  if (sector) {
    query += ` AND SI.sector = $${paramIndex}`;
    queryParams.push(sector);
    paramIndex++;
  }

  // Ensure the query ends properly before adding ORDER BY and LIMIT
  query += ` 
    GROUP BY 
      FSR.ulb_id, FSR.ulb_name, FSR.approved_schemes, FSR.number_of_tender_floated, 
      FSR.amount, FSR.expenditure, FSR.financial_progress_in_percentage, FSR.project_completed, 
      SI.city_type, FSR.project_not_started
    ORDER BY 
      FSR.ulb_id ASC, FSR.approved_schemes DESC, FSR.number_of_tender_floated DESC 
    LIMIT 5`;

  // Execute the raw query using prisma.$queryRawUnsafe
  try {
    return await prisma.$queryRawUnsafe(query, ...queryParams);
  } catch (error) {
    console.error("Error fetching financial summary data:", error);
    throw new Error("Error fetching financial summary data");
  }
};

module.exports = {
  fetchFinancialSummaryReportMillionPlus,
  fetchFinancialSummaryReportNonMillionPlus,
};
