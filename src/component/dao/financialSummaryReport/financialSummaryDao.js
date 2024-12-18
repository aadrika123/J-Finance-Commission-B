const { PrismaClient } = require("@prisma/client");
const logger = require("../../../utils/log/logger");

const prisma = new PrismaClient();

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
      SUM(CASE WHEN s.tender_floated = 'yes' AND s.project_completion_status = 'no' THEN 1 ELSE 0 END) AS number_of_tender_floated,
      SUM(CASE WHEN s.tender_floated = 'no' THEN 1 ELSE 0 END) AS tender_not_floated,
      SUM(
        CASE 
          WHEN s.project_completion_status = 'no' 
            AND s.tender_floated = 'yes' 
            AND s.financial_progress >= 0 
          THEN 1 
          ELSE 0 
        END
      ) AS work_in_progress,
      COUNT(CASE WHEN s.financial_progress = 0 THEN 1 ELSE NULL END) AS project_not_started
    FROM "scheme_info" s
    JOIN "ulb" ulb ON s.ulb_id = ulb.id
    LEFT JOIN "financial_summary_report" f ON ulb.id = f.ulb_id
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
    query += ` AND s.financial_year = '${financial_year}'`;
  }

  query += `
      GROUP BY ulb.id, ulb.ulb_name
      ORDER BY ulb.id ASC
  `;

  const result = await prisma.$queryRawUnsafe(query);

  // Log calculated results
  result.forEach((ulbData) => {
    logger.info(`Detailed Financial Summary for ULB: ${ulbData.ulb_name} (ID: ${ulbData.ulb_id})

    - Total Approved Schemes: ${ulbData.approved_schemes} approved schemes under the ULB.
    - Fund Released to ULBs (Total Project Costs): ₹${ulbData.fund_release_to_ulbs}.
    - Approved Project Costs (Budget): ₹${ulbData.amount}.
    - Completed Projects: ${ulbData.project_completed}.
    - Expenditure (Financial Progress): ₹${ulbData.expenditure}.
    - Remaining Balance (Unspent Budget): ₹${ulbData.balance_amount}.
    - Average Financial Progress: ${ulbData.financial_progress_in_percentage}%.
    - Number of Tenders Floated: ${ulbData.number_of_tender_floated}.
    - Number of Tenders Not Floated: ${ulbData.tender_not_floated}.
    - Work in Progress: ${ulbData.work_in_progress}.
    - Projects Not Started: ${ulbData.project_not_started}.
    `);

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
    });
  });

  logger.info(
    "Detailed financial summary report data retrieved successfully.",
    { result }
  );

  return result;
};

// Find an existing fund release by ULB ID and financial year
const findFundReleaseByUlbIdYearAndFundType = async (
  ulb_id,
  financial_year,
  fund_type
) => {
  try {
    const fundRelease = await prisma.fund_release.findFirst({
      where: {
        ulb_id: ulb_id,
        financial_year: financial_year,
        fund_type: fund_type,
      },
    });
    return fundRelease;
  } catch (error) {
    console.error(
      "Error finding fund release by ULB ID, financial year, and fund type:",
      error
    );
    throw new Error("Failed to find fund release.");
  }
};

const upsertFundReleaseDao = async (
  ulb_id,
  financial_year,
  fund_type,
  fundReleaseData
) => {
  try {
    const existingFundRelease = await findFundReleaseByUlbIdYearAndFundType(
      ulb_id,
      financial_year,
      fund_type
    );

    if (existingFundRelease) {
      fundReleaseData.first_instalment =
        fundReleaseData.first_instalment ?? existingFundRelease.first_instalment;

      fundReleaseData.second_instalment =
        fundReleaseData.second_instalment ?? existingFundRelease.second_instalment;

      fundReleaseData.third_instalment =
        fundReleaseData.third_instalment ?? existingFundRelease.third_instalment;

      fundReleaseData.incentive =
        fundReleaseData.incentive ?? existingFundRelease.incentive;

      fundReleaseData.interest_amount =
        fundReleaseData.interest_amount ?? existingFundRelease.interest_amount;

      // Preserve existing dates if not provided
      fundReleaseData.date_of_release_first =
        fundReleaseData.date_of_release_first ??
        existingFundRelease.date_of_release_first;

      fundReleaseData.date_of_release_second =
        fundReleaseData.date_of_release_second ??
        existingFundRelease.date_of_release_second;

      fundReleaseData.date_of_release_third =
        fundReleaseData.date_of_release_third ??
        existingFundRelease.date_of_release_third;

      fundReleaseData.date_of_release_incentive =
        fundReleaseData.date_of_release_incentive ??
        existingFundRelease.date_of_release_incentive;

      fundReleaseData.date_of_release_interest =
        fundReleaseData.date_of_release_interest ??
        existingFundRelease.date_of_release_interest;
    }

    fundReleaseData.total_fund_released =
      (fundReleaseData.first_instalment || 0) +
      (fundReleaseData.second_instalment || 0) +
      (fundReleaseData.third_instalment || 0) +
      (fundReleaseData.interest_amount || 0) +
      (fundReleaseData.incentive || 0);

    const upsertedFundRelease = await prisma.fund_release.upsert({
      where: {
        ulb_id_financial_year_fund_type: {
          ulb_id,
          financial_year,
          fund_type,
        },
      },
      update: fundReleaseData, // Update with new data
      create: fundReleaseData, // Insert if not exists
    });

    return upsertedFundRelease;
  } catch (error) {
    console.error("Error upserting fund release:", error);
    throw new Error("Failed to upsert fund release.");
  }
};

const getFundReleaseDataDao = async (
  financial_year,
  city_type,
  fund_type,
  ulb_id
) => {
  try {
    const ulbIdAsNumber = ulb_id ? parseInt(ulb_id, 10) : undefined;
    const report = await prisma.fund_release.findMany({
      where: {
        ...(financial_year && { financial_year }), 
        ...(city_type && { city_type }), 
        ...(fund_type && { fund_type }), 
        ...(ulbIdAsNumber && { ulb_id: ulbIdAsNumber }), 
      },
      orderBy: [
        { ulb_id: 'asc' },          
        { city_type: 'asc' },       
        { fund_type: 'asc' },       
        { financial_year: 'asc' }, 
      ],
      select: {
        ulb_id: true,
        ulb_relation: {
          select: {
            ulb_name: true,
          },
        },
        financial_year: true,
        fund_type: true,
        city_type: true,
        first_instalment: true,
        second_instalment: true,
        third_instalment: true,
        incentive: true,
        interest_amount: true,
        total_fund_released: true,
        date_of_release_first: true,
        date_of_release_second: true,
        date_of_release_third: true,
        date_of_release_interest: true,
        date_of_release_incentive: true,
      },
    });

    return report;
  } catch (error) {
    console.error("Error fetching fund release data:", error);
    throw new Error("Failed to fetch fund release data.");
  }
};

module.exports = {
  fetchFinancialSummaryReport,
  findFundReleaseByUlbIdYearAndFundType,
  upsertFundReleaseDao,
  getFundReleaseDataDao,
};
