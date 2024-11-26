const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  createSchemeInfo,
  getSchemeInfo,
  getSchemesByULBName,
  updateSchemeName,
} = require("../../dao/schemeInfo/schemeInfoDao");
const moment = require("moment-timezone");
const logger = require("../../../utils/log/logger");
const createAuditLog = require("../../../utils/auditLog/auditLogger"); // Adjust the path if needed

/**
 *
 *
 * developer - Kaushal Kant Mishra
 *
 * Adds new scheme information to the database.
 *
 * This function:
 * 1. Captures the client's IP address for logging purposes.
 * 2. Extracts scheme details from the request body.
 * 3. Logs an attempt to add new scheme information, including the scheme ID and name.
 * 4. Converts the date of approval to UTC format using moment-timezone.
 * 5. Creates a new scheme entry using the `createSchemeInfo` function.
 * 6. Logs the successful creation of the scheme.
 * 7. Creates an audit log entry for the creation of the scheme information.
 * 8. Sends a success response with the newly created scheme information.
 * 9. Catches and handles errors, logging the error details and sending an appropriate error response.
 *
 * @param {Object} req - The request object containing the scheme details.
 * @param {Object} res - The response object used to send the result back to the client.
 *
 * @returns {void} - Sends a JSON response to the client with the status and data of the newly created scheme.
 */
const addSchemeInfo = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP

  try {
    const {
      scheme_id,
      project_cost,
      scheme_name,
      sector,
      financial_year,
      grant_type,
      city_type,
      date_of_approval, // Date input that can be backdated
      ulb,
    } = req.body;

    const userId = req.body?.auth?.id || null; // Get user ID from request

    // Log the attempt to add new scheme information
    logger.info("Attempting to add new scheme information...", {
      userId,
      action: "ADD_SCHEME_INFO",
      ip: clientIp,
      scheme_id,
      scheme_name,
    });

    // Ensure the backdated 'date_of_approval' is converted to UTC format
    const dateOfApprovedUTC = moment
      .tz(date_of_approval, "Asia/Kolkata")
      .utc()
      .toDate();
    const createdAtUTC = moment.tz("Asia/Kolkata").utc().toDate();

    // Create new scheme information
    const newSchemeInfo = await createSchemeInfo({
      scheme_id,
      project_cost,
      scheme_name,
      sector,
      grant_type,
      financial_year,
      city_type,
      date_of_approval: dateOfApprovedUTC, // Pass the backdated date
      created_at: createdAtUTC,
      ulb,
    });

    // Send success response with status and message
    res.status(201).json(newSchemeInfo);
  } catch (error) {
    // Handle error response with status and message
    logger.error("Error adding scheme information:", error);
    res.status(200).json({
      status: false,
      message: `Error adding scheme information: ${error.message}`,
    });
  }
};

/**
 * Retrieves a paginated list of scheme information from the database.
 *
 * This function:
 * 1. Captures the client's IP address for logging purposes.
 * 2. Extracts pagination parameters (page and take) and the optional `grant_type` filter from query parameters.
 * 3. Validates pagination parameters to ensure they are positive integers.
 * 4. Prepares the filter condition based on the provided `grant_type`.
 * 5. Fetches scheme information and the total count of records using Prisma with optional filtering and pagination.
 * 6. Calculates pagination details such as total pages and next page.
 * 7. Logs the successful fetch of scheme information.
 * 8. Creates an audit log entry for the fetch operation.
 * 9. Sends a success response with the fetched data and pagination details.
 * 10. Catches and handles errors, logging the error details and sending an appropriate error response.
 *
 * @param {Object} req - The request object containing query parameters for pagination and filtering.
 * @param {Object} res - The response object used to send the result back to the client.
 *
 * @returns {void} - Sends a JSON response to the client with the paginated list of scheme information and pagination details.
 */
const fetchSchemeInfo = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP

  try {
    const userId = req.body?.auth?.id || null;
    const page = parseInt(req.query.page, 10) || 1; // Current page number, default to 1
    const limit = parseInt(req.query.limit, 10) || 10; // Records per page, default to 10
    const skip = (page - 1) * limit; // Calculate offset
    const { grant_type, ulb, financial_year } = req.query; // Optional filters

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return res.status(200).json({
        status: false,
        message: "Invalid pagination parameters",
      });
    }

    // Prepare the filter condition for query
    const filterCondition = {};
    if (grant_type) {
      const grantTypes = grant_type.split(",").map((type) => type.trim());
      filterCondition.grant_type =
        grantTypes.length === 1 ? grantTypes[0] : { in: grantTypes };
    }
    if (ulb) {
      filterCondition.ulb = ulb;
    }
    if (financial_year) {
      filterCondition.financial_year = financial_year;
    }

    // Fetch scheme information and total count of records
    const [schemeInfoList, totalResult] = await Promise.all([
      prisma.scheme_info.findMany({
        skip,
        take: limit,
        where: filterCondition,
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.scheme_info.count({
        where: filterCondition,
      }),
    ]);

    // Calculate pagination details
    const totalPage = Math.ceil(totalResult / limit);
    const nextPage = page < totalPage ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    // Log the successful fetch of scheme information
    logger.info("Scheme information list fetched successfully", {
      userId,
      action: "FETCH_SCHEME_INFO",
      ip: clientIp,
      page,
      limit,
      totalResult,
    });

    // Create an audit log entry for the fetch operation
    await createAuditLog(userId, "FETCH", "Scheme_info", null, {
      page,
      limit,
      totalResult,
      grant_type,
    });

    // Send a success response with paginated data and pagination details
    res.status(200).json({
      status: true,
      message: "Scheme request list fetched successfully",
      data: schemeInfoList,
      pagination: {
        next: nextPage,
        previous: prevPage,
        currentPage: page,
        currentTake: limit,
        totalPage,
        totalResult,
      },
    });
  } catch (error) {
    // Log error details and send error response
    logger.error("Error fetching scheme info list", {
      userId,
      action: "FETCH_SCHEME_INFO",
      ip: clientIp,
      error: error.message,
    });
    res.status(200).json({
      status: false,
      message: "Failed to fetch scheme request list",
      error: error.message,
    });
  }
};

/**
 * Retrieves scheme information by its unique ID.
 *
 * This function:
 * 1. Captures the client's IP address for logging purposes.
 * 2. Extracts `scheme_id` from request parameters.
 * 3. Validates that `scheme_id` is provided in the request.
 * 4. Logs an attempt to fetch scheme information by ID.
 * 5. Retrieves scheme information using Prisma's `findUnique` method.
 * 6. Logs the result of the fetch operation, whether successful or not.
 * 7. Creates an audit log entry for the fetch operation.
 * 8. Sends a success response if scheme information is found, or a 404 response if not.
 * 9. Catches and handles errors, logging the error details and sending an appropriate error response.
 *
 * @param {Object} req - The request object containing the scheme ID in the URL parameters.
 * @param {Object} res - The response object used to send the result back to the client.
 *
 * @returns {void} - Sends a JSON response to the client with the scheme information or an error message.
 */
const getSchemeInfoById = async (req, res) => {
  const { scheme_id } = req.params;
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP

  try {
    const userId = req.body?.auth?.id || null;

    // Validate presence of scheme_id
    if (!scheme_id) {
      return res.status(200).json({
        status: true,
        message: "Missing scheme_id",
      });
    }

    // Log the attempt to fetch scheme information by ID
    logger.info(`Fetching scheme information for scheme_id: ${scheme_id}`, {
      userId,
      action: "FETCH_SCHEME_INFO_BY_ID",
      ip: clientIp,
    });

    // Retrieve scheme information by scheme_id
    const schemeInfo = await prisma.scheme_info.findUnique({
      where: { scheme_id: scheme_id },
    });

    if (schemeInfo) {
      // Log successful retrieval of scheme information
      logger.info(`Scheme information found for scheme_id: ${scheme_id}`, {
        userId,
        action: "FETCH_SCHEME_INFO_BY_ID",
        ip: clientIp,
      });

      // Create an audit log entry for the fetch operation
      await createAuditLog(
        userId,
        "FETCH_BY_ID",
        "Scheme_info",
        scheme_id,
        schemeInfo
      );

      // Send success response with scheme information
      res.status(200).json({
        status: true,
        message: "Scheme information retrieved successfully",
        data: schemeInfo,
      });
    } else {
      // Log and respond if scheme information is not found
      logger.warn(`Scheme information not found for scheme_id: ${scheme_id}`, {
        userId,
        action: "FETCH_SCHEME_INFO_BY_ID",
        ip: clientIp,
      });

      res.status(200).json({
        status: true,
        message: "Scheme information not found",
        data: [],
      });
    }
  } catch (error) {
    // Log error details and send error response
    logger.error(`Error fetching scheme info by ID`, {
      userId,
      action: "FETCH_SCHEME_INFO_BY_ID",
      ip: clientIp,
      error: error.message,
    });
    res.status(200).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getSchemesInfoByULBName = async (req, res) => {
  try {
    const { ulb_name } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    if (!ulb_name) {
      return res.status(200).json({
        status: false,
        message: "ULB name is required",
        data: [],
      });
    }

    // Fetch the schemes with pagination
    const schemes = await prisma.scheme_info.findMany({
      where: {
        ulb: {
          equals: ulb_name,
          mode: "insensitive",
        },
      },
      skip,
      take: limit,
      orderBy: {
        created_at: "desc",
      },
    });

    // Fetch the total count for pagination
    const totalSchemes = await prisma.scheme_info.count({
      where: {
        ulb: {
          equals: ulb_name,
          mode: "insensitive",
        },
      },
    });

    const totalPage = Math.ceil(totalSchemes / limit);
    const nextPage = page < totalPage ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    // Add calculated fields to each scheme
    const enhancedSchemes = schemes.map((scheme) => {
      const projectCost = parseFloat(scheme.project_cost || 0);
      const financialProgress = parseFloat(scheme.financial_progress || 0);

      return {
        ...scheme,
        work_in_progress:
          scheme.project_completion_status === "no" &&
          scheme.tender_floated === "yes" &&
          financialProgress >= 0
            ? "yes"
            : "no",
        balance_amount: projectCost - financialProgress,
      };
    });

    return res.status(200).json({
      status: true,
      message: enhancedSchemes.length
        ? "Scheme information fetched successfully"
        : "No schemes found for this ULB name",
      data: enhancedSchemes,
      pagination: {
        next: nextPage,
        previous: prevPage,
        currentPage: page,
        currentTake: limit,
        totalPage,
        totalResult: totalSchemes,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      status: false,
      message: "An error occurred while fetching schemes",
      error: error.message,
    });
  }
};

const updateSchemeNameHandler = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture client IP
  const userId = req.body?.auth?.id || null; // Extract userId from request body
  const { scheme_id, scheme_name } = req.body; // Extract scheme_id and new scheme_name from body

  // Validate input
  if (!scheme_id || !scheme_name ) {
    return res.status(400).json({
      status: "error",
      message: "scheme_id, scheme_name are required",
      data: [],
    });
  }

  try {
    // Fetch the current scheme details before update (for audit log)
    const existingScheme = await prisma.scheme_info.findUnique({
      where: {
        scheme_id: scheme_id,
      },
    });

    if (!existingScheme) {
      return res.status(404).json({
        status: "error",
        message: "Scheme not found",
        data: [],
      });
    }

    // Prepare the changed data for audit log
    const changedData = {
      old_scheme_name: existingScheme.scheme_name,
      new_scheme_name: scheme_name,
    };

    // Update the scheme name in the database
    const updatedScheme = await updateSchemeName(scheme_id, scheme_name);

    // Log the successful update operation
    logger.info("Scheme name updated successfully", {
      userId,
      action: "UPDATE_SCHEME_NAME",
      ip: clientIp,
      scheme_id,
      old_scheme_name: existingScheme.scheme_name,
      new_scheme_name: scheme_name,
    });

    // Create an audit log entry for the update operation
    await createAuditLog(
      userId,
      "UPDATE",
      "Scheme_info",
      scheme_id,
      changedData
    );

    // Send a success response with updated scheme details
    return res.status(200).json({
      status: "success",
      message: "Scheme name updated successfully",
      data: [updatedScheme],
    });
  } catch (error) {
    // Log error details and send error response
    logger.error("Error updating scheme name", {
      userId,
      action: "UPDATE_SCHEME_NAME",
      ip: clientIp,
      error: error.message,
    });

    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      data: [],
    });
  }
};
module.exports = {
  addSchemeInfo,
  fetchSchemeInfo,
  getSchemeInfoById,
  getSchemesInfoByULBName,
  updateSchemeNameHandler,
};
