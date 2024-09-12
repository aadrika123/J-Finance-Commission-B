const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  createSchemeInfo,
  getSchemeInfo,
} = require("../../dao/schemeInfo/schemeInfoDao");
const moment = require("moment-timezone");
const logger = require("../../../utils/log/logger");

const addSchemeInfo = async (req, res) => {
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

    logger.info("Attempting to add new scheme information...");

    // Convert the input date to UTC using the Asia/Kolkata timezone
    const dateOfApprovedUTC = moment
      .tz(date_of_approval, "Asia/Kolkata")
      .utc()
      .toDate();

    // Get the current time in Asia/Kolkata timezone and convert it to UTC
    const createdAtKolkata = moment.tz("Asia/Kolkata").toDate();
    const createdAtUTC = moment(createdAtKolkata).utc().toDate();

    const newSchemeInfo = await createSchemeInfo({
      scheme_id,
      project_cost,
      scheme_name,
      sector,
      grant_type,
      city_type,
      date_of_approval: dateOfApprovedUTC,
      created_at: createdAtUTC, // Pass the UTC time to the DAO
      ulb,
    });

    logger.info("Scheme information created successfully", {
      scheme_id,
      scheme_name,
      ulb,
    });

    res.status(201).json({
      status: true,
      message: "Scheme information created successfully",
      data: newSchemeInfo,
    });
  } catch (error) {
    logger.error(`Error creating scheme info: ${error.message}`, { error });
    res.status(500).json({
      status: false,
      message: "Failed to create scheme information",
      error: error.message,
    });
  }
};

const fetchSchemeInfo = async (req, res) => {
  try {
    logger.info("Fetching scheme information list...");

    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const take = parseInt(req.query.take) || 10;

    // Calculate the offset
    const skip = (page - 1) * take;

    // Fetch paginated data sorted by created_at in descending order
    const [schemeInfoList, totalResult] = await Promise.all([
      prisma.scheme_info.findMany({
        skip,
        take,
        orderBy: {
          created_at: "desc", // Sort by created_at in descending order
        },
      }),
      prisma.scheme_info.count(),
    ]);

    const totalPage = Math.ceil(totalResult / take);
    const nextPage = page < totalPage ? page + 1 : null;

    logger.info("Scheme information list fetched successfully", {
      page,
      take,
      totalResult,
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
    logger.error(`Error fetching scheme info list: ${error.message}`, {
      error,
    });
    res.status(500).json({
      status: false,
      message: "Failed to fetch scheme request list",
      error: error.message,
    });
  }
};

const getSchemeInfoById = async (req, res) => {
  const { scheme_id } = req.params;

  try {
    logger.info(`Fetching scheme information for scheme_id: ${scheme_id}`);

    const schemeInfo = await prisma.scheme_info.findUnique({
      where: { scheme_id },
    });

    if (schemeInfo) {
      logger.info(`Scheme information found for scheme_id: ${scheme_id}`);

      res.status(200).json({
        status: true,
        message: "Scheme information retrieved successfully",
        data: schemeInfo,
      });
    } else {
      logger.warn(`Scheme information not found for scheme_id: ${scheme_id}`);

      res.status(404).json({
        status: false,
        message: "Scheme information not found",
      });
    }
  } catch (error) {
    logger.error(`Error fetching scheme info by ID: ${error.message}`, {
      error,
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
