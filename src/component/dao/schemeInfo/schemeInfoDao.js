const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const logger = require("../../../utils/log/logger");
const moment = require("moment-timezone");

const VALID_GRANT_TYPES = ["tied", "untied", "ambient"];
const VALID_CITY_TYPES = ["million plus", "non million"];

/**
 * Generates a new scheme ID based on the latest scheme ID in the database.
 *
 * This function:
 * 1. Fetches the latest scheme record from the database.
 * 2. Extracts and increments the scheme number from the latest scheme ID.
 * 3. Formats the new scheme ID as `sch-03-xxx`.
 *
 * @returns {Promise<string>} - Returns a promise that resolves to the newly generated scheme ID.
 */
const generateSchemeId = async (ulb_id) => {
  try {
    // Fetch the latest scheme_info record for the specific ulb_id
    const lastScheme = await prisma.scheme_info.findFirst({
      where: { ulb_id: ulb_id },
      orderBy: {
        // Assuming scheme_id is in the format 'sch-{ulb_id}-{number}'
        scheme_id: "desc",
      },
    });

    let newSchemeNumber = 1; // Default number if no previous schemes exist

    if (lastScheme && lastScheme.scheme_id) {
      const lastSchemeId = lastScheme.scheme_id;
      const parts = lastSchemeId.split("-");

      // Ensure the scheme_id has the correct format
      if (parts.length === 3 && parts[1] == ulb_id.toString()) {
        const lastNumber = parseInt(parts[2], 10);
        if (!isNaN(lastNumber)) {
          newSchemeNumber = lastNumber + 1;
        }
      }
    }

    // Format the new scheme_id as 'sch-{ulb_id}-{xxx}'
    const newSchemeId = `sch-${ulb_id}-${newSchemeNumber
      .toString()
      .padStart(3, "0")}`;

    return newSchemeId;
  } catch (error) {
    console.error("Error generating scheme ID:", error);
    throw new Error("Error generating scheme ID");
  }
};
/**
 * Creates a new scheme information record in the database.
 *
 * This function:
 * 1. Generates a new scheme ID.
 * 2. Converts the date of approval to UTC.
 * 3. Inserts a new scheme record into the database.
 *
 * @param {Object} data - The data for the new scheme record.
 * @param {string} data.project_cost - The project cost.
 * @param {string} data.scheme_name - The name of the scheme.
 * @param {string} data.sector - The sector of the scheme.
 * @param {string} data.grant_type - The grant type.
 * @param {string} data.city_type - The city type.
 * @param {string} data.date_of_approval - The date of approval.
 * @param {string} data.ulb - The ULB name.
 *
 * @returns {Promise<Object>} - Returns a promise that resolves to the newly created scheme record.
 */
const createSchemeInfo = async (data) => {
  try {
    // Validate the incoming data
    if (!data.scheme_name || typeof data.scheme_name !== "string") {
      throw new Error("Invalid scheme name. It must be a non-empty string.");
    }

    // Validate project_cost and approved_project_cost
    if (
      !data.project_cost ||
      typeof data.project_cost !== "number" ||
      data.project_cost <= 0
    ) {
      throw new Error("Invalid project cost. It must be a positive number.");
    }

    // if (
    //   !data.approved_project_cost ||
    //   typeof data.approved_project_cost !== "number" ||
    //   data.approved_project_cost <= 0
    // ) {
    //   throw new Error(
    //     "Invalid approved project cost. It must be a positive number."
    //   );
    // }

    if (data.sector && typeof data.sector !== "string") {
      throw new Error("Invalid sector. It must be a string.");
    }

    if (!VALID_GRANT_TYPES.includes(data.grant_type)) {
      throw new Error(
        `Invalid grant type. Valid types are: ${VALID_GRANT_TYPES.join(", ")}`
      );
    }

    if (!VALID_CITY_TYPES.includes(data.city_type)) {
      throw new Error(
        `Invalid city type. Valid types are: ${VALID_CITY_TYPES.join(", ")}`
      );
    }

    if (
      !data.date_of_approval ||
      !moment(data.date_of_approval, moment.ISO_8601).isValid()
    ) {
      throw new Error("Invalid date of approval. It must be a valid date.");
    }

    // Log the request to create a new scheme
    logger.info({
      message: `Creating new scheme for ULB: ${data.ulb}`,
      ulb: data.ulb,
      action: "createSchemeInfo",
    });

    // Fetch ulb_id from ULB table using ulb name
    const ulbRecord = await prisma.uLB.findUnique({
      where: {
        ulb_name: data.ulb, // Assuming the ulb_name field matches the ulb field in the request
      },
      select: { id: true }, // Only fetch the id (ulb_id)
    });

    if (!ulbRecord) {
      throw new Error(`ULB not found for name: ${data.ulb}`);
    }

    const ulb_id = ulbRecord.id;

    // Generate the new scheme_id using the ulb_id
    const scheme_id = await generateSchemeId(ulb_id);

    // Convert date of approval (including backdated entries) to UTC
    const dateInUTC = moment
      .tz(data.date_of_approval, "Asia/Kolkata")
      .utc()
      .toDate();

    // Create a new scheme_info record with the ulb_id
    const createdScheme = await prisma.scheme_info.create({
      data: {
        scheme_id, // Use the generated scheme_id
        project_cost: data.project_cost,
        approved_project_cost: data.project_cost,
        scheme_name: data.scheme_name,
        sector: data.sector,
        grant_type: data.grant_type,
        city_type: data.city_type,
        date_of_approval: dateInUTC, // Store backdated date in UTC
        created_at: new Date(), // Automatically handled by Prisma in UTC
        ulb: data.ulb,
        ulb_id, // Include the fetched ulb_id
      },
    });

    // Log detailed information of the created scheme
    logger.info({
      message: `Scheme created successfully for ULB: ${data.ulb}`,
      schemeDetails: {
        scheme_id: createdScheme.scheme_id,
        project_cost: createdScheme.project_cost,
        approved_project_cost: createdScheme.project_cost,
        scheme_name: createdScheme.scheme_name,
        sector: createdScheme.sector,
        grant_type: createdScheme.grant_type,
        city_type: createdScheme.city_type,
        date_of_approval: createdScheme.date_of_approval,
        created_at: createdScheme.created_at,
        ulb: createdScheme.ulb,
        ulb_id,
      },
      action: "createSchemeInfo",
    });

    return createdScheme;
  } catch (error) {
    console.error("Error creating scheme information:", error);
    throw new Error("Error creating scheme information: " + error.message);
  }
};

/**
 * Retrieves all scheme information records from the database.
 *
 * This function:
 * 1. Fetches all scheme_info records.
 * 2. Orders the results by scheme_id in ascending order.
 *
 * @returns {Promise<Object[]>} - Returns a promise that resolves to an array of scheme records.
 */
const getSchemeInfo = async () => {
  try {
    return await prisma.scheme_info.findMany({
      orderBy: {
        scheme_id: "asc", // Sort in ascending order
      },
    });
  } catch (error) {
    console.error("Error fetching scheme information:", error);
    throw new Error("Error fetching scheme information");
  }
};

module.exports = {
  createSchemeInfo,
  getSchemeInfo,
};
