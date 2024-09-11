const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const fetchFinancialSummaryReport = async (
  city_type,
  grant_type,
  sector,
  financial_year
) => {
  // Build the query conditionally with parameters
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
    FROM "ULB" ulb
    LEFT JOIN "Scheme_info" s ON ulb.ulb_name = s.ulb
    WHERE 1=1
  `;

  // Add filters conditionally based on the parameters provided
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

  query += ` GROUP BY ulb.id, ulb.ulb_name ORDER BY ulb.id ASC`;

  // Execute the query
  return await prisma.$queryRawUnsafe(query);
};

module.exports = {
  fetchFinancialSummaryReport,
};
