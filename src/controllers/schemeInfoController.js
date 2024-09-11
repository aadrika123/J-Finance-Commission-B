const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  createSchemeInfo,
  getSchemeInfo,
} = require("../dao/schemeInfo/schemeInfoDao");
const moment = require("moment-timezone");

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

    res.status(201).json({
      status: true,
      message: "Scheme information created successfully",
      data: newSchemeInfo,
    });
  } catch (error) {
    console.error("Error creating scheme info:", error);
    res.status(500).json({
      status: false,
      message: "Failed to create scheme information",
      error: error.message,
    });
  }
};

const fetchSchemeInfo = async (req, res) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const take = parseInt(req.query.take) || 10;

    // Calculate the offset
    const skip = (page - 1) * take;

    // Fetch paginated data
    const [schemeInfoList, totalResult] = await Promise.all([
      prisma.scheme_info.findMany({
        skip,
        take,
      }),
      prisma.scheme_info.count(),
    ]);

    const totalPage = Math.ceil(totalResult / take);
    const nextPage = page < totalPage ? page + 1 : null;

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
    console.error("Error fetching scheme info:", error);
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
    const schemeInfo = await prisma.scheme_info.findUnique({
      where: { scheme_id },
    });

    if (schemeInfo) {
      res.status(200).json({
        status: true,
        message: "Scheme information retrieved successfully",
        data: schemeInfo,
      });
    } else {
      res.status(404).json({
        status: false,
        message: "Scheme information not found",
      });
    }
  } catch (error) {
    console.error("Error fetching scheme info:", error);
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
