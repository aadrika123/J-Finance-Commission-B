const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const fetchFinancialSummaryReport = async () => {
  return prisma.$queryRaw`
    SELECT ulb.ulb_name, 
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
    GROUP BY ulb.ulb_name;
  `;
};

module.exports = {
  fetchFinancialSummaryReport,
};
