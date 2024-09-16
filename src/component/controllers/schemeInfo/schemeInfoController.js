const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  createSchemeInfo,
  getSchemeInfo,
} = require("../../dao/schemeInfo/schemeInfoDao");
const moment = require("moment-timezone");
const logger = require("../../../utils/log/logger");
const createAuditLog = require("../../../utils/auditLog/auditLogger"); // Adjust the path if needed

const addSchemeInfo = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP

  try {
    const {
      scheme_id,
      project_cost,
      scheme_name,
      sector,
      grant_type,
      city_type,
      date_of_approval,
      ulb,
    } = req.body;

    const userId = req.body?.auth?.id || null; // Get user ID from request

    logger.info("Attempting to add new scheme information...", {
      userId,
      action: "ADD_SCHEME_INFO",
      ip: clientIp,
      scheme_id,
      scheme_name,
    });

    const dateOfApprovedUTC = moment
      .tz(date_of_approval, "Asia/Kolkata")
      .utc()
      .toDate();
    const createdAtUTC = moment.tz("Asia/Kolkata").utc().toDate();

    const newSchemeInfo = await createSchemeInfo({
      scheme_id,
      project_cost,
      scheme_name,
      sector,
      grant_type,
      city_type,
      date_of_approval: dateOfApprovedUTC,
      created_at: createdAtUTC,
      ulb,
    });

    logger.info("Scheme information created successfully", {
      userId,
      action: "ADD_SCHEME_INFO",
      ip: clientIp,
      scheme_id,
      scheme_name,
    });

    // Audit Log
    await createAuditLog(userId, "CREATE", "Scheme_info", scheme_id, req.body);

    res.status(201).json({
      status: true,
      message: "Scheme information created successfully",
      data: newSchemeInfo,
    });
  } catch (error) {
    logger.error("Error creating scheme info", {
      userId,
      action: "ADD_SCHEME_INFO",
      ip: clientIp,
      error: error.message,
    });
    res.status(500).json({
      status: false,
      message: "Failed to create scheme information",
      error: error.message,
    });
  }
};

const fetchSchemeInfo = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP

  try {
    const userId = req.body?.auth?.id || null;
    const page = parseInt(req.query.page) || 1;
    const take = parseInt(req.query.take) || 10;
    const skip = (page - 1) * take;
    const { grant_type } = req.query; // Get the grant_type filter from query params

    // Prepare the filter condition
    const filterCondition = {};
    if (grant_type) {
      filterCondition.grant_type = grant_type;
    }

    // Fetch scheme information with optional grant_type filter
    const [schemeInfoList, totalResult] = await Promise.all([
      prisma.scheme_info.findMany({
        skip,
        take,
        where: filterCondition, // Apply the filter if grant_type is provided
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.scheme_info.count({
        where: filterCondition, // Count the results considering the filter
      }),
    ]);

    const totalPage = Math.ceil(totalResult / take);
    const nextPage = page < totalPage ? page + 1 : null;

    logger.info("Scheme information list fetched successfully", {
      userId,
      action: "FETCH_SCHEME_INFO",
      ip: clientIp,
      page,
      take,
      totalResult,
    });

    // Audit Log (optional, as fetching data isn't always logged)
    await createAuditLog(userId, "FETCH", "Scheme_info", null, {
      page,
      take,
      totalResult,
      grant_type,
    });

    res.status(200).json({
      status: true,
      message: "Scheme request list fetched successfully",
      data: schemeInfoList,
      pagination: {
        next: nextPage ? { page: nextPage, take } : null,
        currentPage: page,
        currentTake: take,
        totalPage,
        totalResult,
      },
    });
  } catch (error) {
    logger.error("Error fetching scheme info list", {
      userId,
      action: "FETCH_SCHEME_INFO",
      ip: clientIp,
      error: error.message,
    });
    res.status(500).json({
      status: false,
      message: "Failed to fetch scheme request list",
      error: error.message,
    });
  }
};

const getSchemeInfoById = async (req, res) => {
  const { scheme_id } = req.params; // Make sure scheme_id is coming from params
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP

  try {
    const userId = req.body?.auth?.id || null;
    logger.info(`Fetching scheme information for scheme_id: ${scheme_id}`, {
      userId,
      action: "FETCH_SCHEME_INFO_BY_ID",
      ip: clientIp,
    });

    // Use findUnique to search for scheme_info by the scheme_id string
    const schemeInfo = await prisma.scheme_info.findUnique({
      where: { scheme_id: scheme_id }, // Make sure to match scheme_id as a string
    });

    if (schemeInfo) {
      logger.info(`Scheme information found for scheme_id: ${scheme_id}`, {
        userId,
        action: "FETCH_SCHEME_INFO_BY_ID",
        ip: clientIp,
      });

      // Audit Log
      await createAuditLog(
        userId,
        "FETCH_BY_ID",
        "Scheme_info",
        scheme_id,
        schemeInfo
      );

      res.status(200).json({
        status: true,
        message: "Scheme information retrieved successfully",
        data: schemeInfo,
      });
    } else {
      logger.warn(`Scheme information not found for scheme_id: ${scheme_id}`, {
        userId,
        action: "FETCH_SCHEME_INFO_BY_ID",
        ip: clientIp,
      });

      res.status(404).json({
        status: false,
        message: "Scheme information not found",
      });
    }
  } catch (error) {
    logger.error(`Error fetching scheme info by ID`, {
      userId,
      action: "FETCH_SCHEME_INFO_BY_ID",
      ip: clientIp,
      error: error.message,
    });
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  addSchemeInfo,
  fetchSchemeInfo,
  getSchemeInfoById,
};
