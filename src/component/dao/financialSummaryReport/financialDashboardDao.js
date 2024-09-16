const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const fetchFinancialSummaryReportMillionPlus = async (filters) => {
  const { ulb_name, grant_type, financial_year, sector } = filters;

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
      SI.city_type = 'Million Plus Cities'
  `;

  const queryParams = [];
  let paramIndex = 1; // Index for PostgreSQL numbered parameters

  // Add optional filters based on the provided parameters
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
const fetchFinancialSummaryReportNonMillionPlus = async (filters = {}) => {
  // Destructure filters with default values
  const { ulb_name, grant_type, financial_year, sector } = filters;

  let query = `
    SELECT ulb.id AS ulb_id,
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
           (COUNT(s.scheme_name) - SUM(CASE WHEN s.project_completion_status = 'yes' THEN 1 ELSE 0 END)) AS work_in_progress
    FROM "Scheme_info" s
    JOIN "ULB" ulb ON s.ulb = ulb.ulb_name
    WHERE s.city_type = 'Non Million Cities'
  `;

  const queryParams = [];
  let paramIndex = 1;

  // Add optional filters based on the provided parameters
  if (ulb_name) {
    query += ` AND ulb.ulb_name = $${paramIndex}`;
    queryParams.push(ulb_name);
    paramIndex++;
  }
  if (grant_type) {
    query += ` AND s.grant_type = $${paramIndex}`;
    queryParams.push(grant_type);
    paramIndex++;
  }
  if (financial_year) {
    query += ` AND EXTRACT(YEAR FROM s.date_of_approval) = $${paramIndex}`;
    queryParams.push(financial_year);
    paramIndex++;
  }
  if (sector) {
    query += ` AND s.sector = $${paramIndex}`;
    queryParams.push(sector);
    paramIndex++;
  }

  query += ` GROUP BY ulb.id, ulb.ulb_name ORDER BY ulb.id ASC`;

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
