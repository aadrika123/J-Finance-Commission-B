const { PrismaClient } = require("@prisma/client");
const logger = require("../../../utils/log/logger");

const prisma = new PrismaClient();

/**
 * Fetches ULBs along with their financial summary data.
 *
 * This function:
 * 1. Retrieves a list of ULBs and their associated financial summary data from the database.
 * 2. Joins the "ULB" and "FinancialSummaryReport" tables to get comprehensive information.
 *
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of ULBs with financial data.
 *
 * @throws {Error} - Throws an error if the query fails.
 */
const getULBs = async () => {
  try {
    const ulbs = await prisma.$queryRaw`
      SELECT 
        ulb.id AS id,
        ulb.ulb_name AS ulb_name,
        ulb.longitude,
        ulb.latitude,
        fsr.approved_schemes,
        fsr.fund_release_to_ulbs,
        fsr.amount,
        fsr.project_completed,
        fsr.expenditure,
        fsr.balance_amount,
        fsr.financial_progress_in_percentage,
        fsr.number_of_tender_floated,
        fsr.tender_not_floated,
        fsr.work_in_progress
      FROM 
        ulb 
      LEFT JOIN 
        financial_summary_report AS fsr
      ON 
        ulb.id = fsr.ulb_id
      ORDER BY 
        ulb.id ASC;
    `;

    // Log the fetched ULB data with financial summary
    logger.info({
      message: "Fetched ULB data with financial summary",
      resultCount: ulbs.length,
      action: "getULBs",
    });

    return ulbs;
  } catch (error) {
    console.error("Error fetching ULBs with financial data:", error);
    throw new Error("Error fetching ULBs with financial data");
  }
};

/**
 * Fetches ULBs along with their schemes and financial progress data.
 *
 * This function:
 * 1. Retrieves a list of ULBs with associated schemes and their financial progress from the database.
 * 2. Joins the "ULB", "FinancialSummaryReport", and "Scheme_info" tables.
 * 3. Filters out schemes with null financial progress.
 *
 * @returns {Promise<Array>} - Returns a promise that resolves to an array of ULBs with scheme data.
 *
 * @throws {Error} - Throws an error if the query fails.
 */
const getULBsAndSchemes = async () => {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        ulb.id AS ulb_id,
        ulb.ulb_name,
        fsr.approved_schemes AS total_schemes_fsr,
        fsr.financial_progress_in_percentage AS financial_progress_percentage_fsr,
        COUNT(scheme_info.scheme_name) AS total_schemes_schemeinfo,  -- Count total schemes from scheme_info
        ROUND(AVG(scheme_info.financial_progress_in_percentage)::numeric, 3) AS financial_progress_in_percentage_schemeinfo,  -- Average financial progress from scheme_info, cast to numeric
        SUM(scheme_info.financial_progress) AS total_financial_progress_schemeinfo -- Sum of financial progress from scheme_info
      FROM 
        ulb
      LEFT JOIN 
        financial_summary_report AS fsr
      ON 
        ulb.id = fsr.ulb_id
      LEFT JOIN 
        scheme_info
      ON 
        ulb.id = scheme_info.ulb_id  -- Using ulb_id for the relationship
      WHERE
        scheme_info.financial_progress IS NOT NULL
      GROUP BY 
        ulb.id, ulb.ulb_name, fsr.approved_schemes, fsr.financial_progress_in_percentage -- Group by ULB and financial_summary_report fields
      ORDER BY 
        total_financial_progress_schemeinfo DESC;
    `;

    // Log the ULBs and their financial progress
    result.forEach((ulb) => {
      logger.info({
        message: `ULB: ${ulb.ulb_name}`,
        totalSchemesSchemeInfo: ulb.total_schemes_schemeinfo,
        avgFinancialProgressSchemeInfo:
          ulb.financial_progress_in_percentage_schemeinfo,
        totalFinancialProgressSchemeInfo:
          ulb.total_financial_progress_schemeinfo,
        action: "getULBsAndSchemes",
      });
    });

    return result;
  } catch (error) {
    console.error("Error fetching ULB and scheme data:", error);
    throw new Error("Error fetching ULB and scheme data");
  }
};

const getULBInfoByCityType = async (city_type) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        ulb.id AS ulb_id,
        ulb.ulb_name,
        ulb.city_type
      FROM 
        ulb
      WHERE 
        ulb.city_type = ${city_type};
    `;

    return result;
  } catch (error) {
    console.error("Error fetching ULB info by city type:", error);
    throw new Error("Error fetching ULB info by city type");
  }
};

module.exports = {
  getULBs,
  getULBsAndSchemes,
  getULBInfoByCityType,
};
