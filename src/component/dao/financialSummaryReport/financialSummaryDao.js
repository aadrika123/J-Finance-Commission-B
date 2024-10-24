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
      SUM(CASE WHEN s.tender_floated = 'yes' THEN 1 ELSE 0 END) AS number_of_tender_floated,
      SUM(CASE WHEN s.tender_floated = 'no' THEN 1 ELSE 0 END) AS tender_not_floated,
      (COUNT(s.scheme_name) - SUM(CASE WHEN s.project_completion_status = 'yes' THEN 1 ELSE 0 END)) AS work_in_progress,
      COUNT(CASE WHEN s.financial_progress = 0 THEN 1 ELSE NULL END) AS project_not_started
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
    // query += ` AND s.financial_year) = '${financial_year}'`;
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
    });
  });

  logger.info(
    "Detailed financial summary report data retrieved successfully.",
    { result }
  );

  return result;
};

// Find an existing fund release by ULB ID and financial year
const findFundReleaseByUlbIdAndYear = async (ulb_id, financial_year) => {
  try {
    const fundRelease = await prisma.fundRelease.findFirst({
      where: {
        ulb_id: ulb_id,
        financial_year: financial_year,
      },
    });
    return fundRelease;
  } catch (error) {
    console.error(
      "Error finding fund release by ULB ID and financial year:",
      error
    );
    throw new Error("Failed to find fund release.");
  }
};

// Upsert (insert or update) the fund release data
const upsertFundReleaseDao = async (
  ulb_id,
  financial_year,
  fundReleaseData
) => {
  try {
    // Fetch existing fund release data
    const existingFundRelease = await prisma.fundRelease.findFirst({
      where: { ulb_id, financial_year },
    });

    let total_fund_released = 0;

    // If a record exists, add the new interest_amount to the existing one
    if (existingFundRelease) {
      // Add current interest_amount to the previous interest_amount
      if (fundReleaseData.interest_amount !== undefined) {
        fundReleaseData.interest_amount =
          (existingFundRelease.interest_amount || 0) +
          fundReleaseData.interest_amount;
      }

      // Prevent overwriting installments if they already exist
      if (
        existingFundRelease.first_instalment &&
        fundReleaseData.first_instalment
      ) {
        delete fundReleaseData.first_instalment;
      }
      if (
        existingFundRelease.second_instalment &&
        fundReleaseData.second_instalment
      ) {
        delete fundReleaseData.second_instalment;
      }
      if (
        existingFundRelease.third_instalment &&
        fundReleaseData.third_instalment
      ) {
        delete fundReleaseData.third_instalment;
      }

      // Calculate total fund released
      total_fund_released =
        (existingFundRelease.first_instalment || 0) +
        (existingFundRelease.second_instalment || 0) +
        (existingFundRelease.third_instalment || 0) +
        (fundReleaseData.interest_amount ||
          existingFundRelease.interest_amount ||
          0);
    } else {
      // Calculate total_fund_released when creating a new record
      total_fund_released =
        (fundReleaseData.first_instalment || 0) +
        (fundReleaseData.second_instalment || 0) +
        (fundReleaseData.third_instalment || 0) +
        (fundReleaseData.interest_amount || 0);
    }

    // Set the calculated total_fund_released in fundReleaseData
    fundReleaseData.total_fund_released = total_fund_released;

    // Perform the upsert operation
    const upsertedFundRelease = await prisma.fundRelease.upsert({
      where: {
        ulb_id_financial_year: {
          ulb_id,
          financial_year,
        },
      },
      update: fundReleaseData,
      create: fundReleaseData,
    });

    return upsertedFundRelease;
  } catch (error) {
    console.error("Error upserting fund release:", error);
    throw new Error("Failed to upsert fund release.");
  }
};

const getFundReleaseDataDao = async (financial_year, city_type, fund_type) => {
  try {
    // Fetch data from fundRelease table
    const report = await prisma.fundRelease.findMany({
      where: {
        ...(financial_year && { financial_year }), // Filter by financial_year if provided
        ...(city_type && { city_type }), // Filter by city_type if provided
        ...(fund_type && { fund_type }), // Filter by fund_type if provided
      },
      select: {
        ulb_id: true,
        ULB: { select: { ulb_name: true } }, // Fetch ULB name if needed
        financial_year: true,
        fund_type: true,
        city_type: true,
        first_instalment: true,
        second_instalment: true,
        third_instalment: true,
        interest_amount: true,
        total_fund_released: true,
        date_of_release: true,
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
  findFundReleaseByUlbIdAndYear,
  upsertFundReleaseDao,
  getFundReleaseDataDao,
};
