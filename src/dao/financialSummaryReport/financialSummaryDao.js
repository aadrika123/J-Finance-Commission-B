const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const fetchFinancialSummaryReport = async () => {
  return await prisma.$queryRaw`
    SELECT 
      ULB.ulb_name,
      SUM(s.scheme_name IS NOT NULL) AS approved_schemes,
      SUM(s.project_cost) AS fund_release_to_ulbs,
      SUM(s.approved_project_cost) AS amount,
      SUM(s.project_completion_status = 'yes') AS project_completed,
      SUM(s.financial_progress) AS expenditure,
      (SUM(s.project_cost) - SUM(s.financial_progress)) AS balance_amount,
      (SUM(s.financial_progress) / SUM(s.project_cost)) * 100 AS financial_progress_in_percentage,
      SUM(s.tender_floated = 'yes') AS number_of_tender_floated,
      SUM(s.tender_floated = 'no') AS tender_not_floated,
      (SUM(s.scheme_name IS NOT NULL) - SUM(s.project_completion_status = 'yes')) AS work_in_progress
    FROM ULB ulb
    LEFT JOIN Scheme_info s ON s.ulb = ULB.ulb_name
    GROUP BY ULB.ulb_name
  `;
};

module.exports = {
  fetchFinancialSummaryReport,
};
