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

  // Base SQL query to fetch data for Million Plus Cities
  let query = `
    SELECT 
      FSR.ulb_id,
      FSR.ulb_name,
      (FSR.number_of_tender_floated + FSR.tender_not_floated) AS approved_project,
      FSR.number_of_tender_floated AS tender_approved,
      FSR.amount AS approved_amount,
      FSR.expenditure,
      FSR.financial_year,
      FSR.grant_type,
      SI.sector,
      SI.city_type
    FROM 
      "FinancialSummaryReport" FSR
    INNER JOIN 
      "Scheme_info" SI
    ON 
      FSR.ulb_name = SI.ulb
    WHERE 
      SI.city_type = 'million plus'
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
    query += ` AND FSR.grant_type = $${paramIndex}`;
    queryParams.push(grant_type);
    paramIndex++;
  }
  if (financial_year) {
    query += ` AND FSR.financial_year = $${paramIndex}`;
    queryParams.push(financial_year);
    paramIndex++;
  }
  if (sector) {
    query += ` AND SI.sector = $${paramIndex}`;
    queryParams.push(sector);
    paramIndex++;
  }

  // Ensure the query ends properly before adding ORDER BY
  query += ` ORDER BY FSR.ulb_id ASC`;

  // Execute the raw query using prisma.$queryRawUnsafe
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
  // Destructure filters with default values
  const { ulb_name, grant_type, financial_year, sector } = filters;

  // Base SQL query to fetch data for Non-Million Plus Cities
  let query = `
    SELECT 
      FSR.ulb_id,
      FSR.ulb_name,
      (FSR.number_of_tender_floated + FSR.tender_not_floated) AS approved_project,
      FSR.number_of_tender_floated AS tender_approved,
      FSR.amount AS approved_amount,
      FSR.expenditure,
      FSR.financial_year,
      FSR.grant_type,
      SI.sector,
      SI.city_type
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
    query += ` AND FSR.grant_type = $${paramIndex}`;
    queryParams.push(grant_type);
    paramIndex++;
  }
  if (financial_year) {
    query += ` AND FSR.financial_year = $${paramIndex}`;
    queryParams.push(financial_year);
    paramIndex++;
  }
  if (sector) {
    query += ` AND SI.sector = $${paramIndex}`;
    queryParams.push(sector);
    paramIndex++;
  }

  // Ensure the query ends properly before adding ORDER BY
  query += ` ORDER BY FSR.ulb_id ASC`;

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
