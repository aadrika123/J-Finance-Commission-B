const { PrismaClient } = require("@prisma/client");
const logger = require("../../../utils/log/logger");
const moment = require("moment-timezone");

const prisma = new PrismaClient();

/**
 * Updates the scheme information in the database based on the provided scheme ID and data.
 *
 * This function:
 * 1. Prepares the update data based on the fields present in the `data` parameter.
 * 2. Updates the `scheme_info` record in the database with the prepared data.
 *
 * @param {string} scheme_id - The ID of the scheme to update.
 * @param {Object} data - The data to update the scheme with.
 * @param {string} [data.sector] - The new sector of the scheme.
 * @param {string} [data.project_completion_status] - The new project completion status.
 * @param {string} [data.tender_floated] - The new tender floated status.
 * @param {number} [data.financial_progress] - The new financial progress amount.
 * @param {number} [data.financial_progress_in_percentage] - The new financial progress percentage.
 * @param {number} [data.project_completion_status_in_percentage] - The new project completion status percentage.
 *
 * @returns {Promise<Object>} - Returns a promise that resolves to the updated scheme record.
 *
 * @throws {Error} - Throws an error if the update operation fails.
 */

const updateSchemeInfo = async (scheme_id, data) => {
  try {
    // Fetch the existing scheme record to validate against
    const existingScheme = await prisma.scheme_info.findUnique({
      where: { scheme_id },
    });

    if (!existingScheme) {
      return {
        status: false,
        message: `Scheme with ID ${scheme_id} does not exist`,
      };
    }

    // Prepare the update data object
    const updateData = {};

    // Validate and add fields to updateData only if they are present in the incoming data
    if (data.sector !== undefined) {
      if (typeof data.sector !== "string") {
        return {
          status: false,
          message: "Invalid sector. It must be a string.",
        };
      }
      updateData.sector = data.sector;
    }

    // Handle project completion status
    if (data.project_completion_status !== undefined) {
      updateData.project_completion_status = data.project_completion_status;

      // If project_completion_status is "yes", set completion percentage to 100
      if (data.project_completion_status.toLowerCase() === "yes") {
        updateData.project_completion_status_in_percentage = 100;
      }
    }

    // Check if project_completion_status_in_percentage is provided
    if (data.project_completion_status_in_percentage !== undefined) {
      if (
        typeof data.project_completion_status_in_percentage !== "number" ||
        data.project_completion_status_in_percentage < 0 ||
        data.project_completion_status_in_percentage > 100
      ) {
        return {
          status: false,
          message:
            "Project completion status percentage must be between 0 and 100.",
        };
      }
      // Only overwrite if it wasn't set by the "yes" condition
      if (updateData.project_completion_status_in_percentage === undefined) {
        updateData.project_completion_status_in_percentage =
          data.project_completion_status_in_percentage;
      }
    }

    if (data.tender_floated !== undefined) {
      updateData.tender_floated = data.tender_floated;
    }

    if (data.financial_progress !== undefined) {
      if (
        typeof data.financial_progress !== "number" ||
        data.financial_progress < 0
      ) {
        return {
          status: false,
          message:
            "Financial progress must be a non-negative number and you can not change it .",
        };
      }
      updateData.financial_progress = data.financial_progress;

      // Calculate financial_progress_in_percentage
      if (existingScheme.approved_project_cost > 0) {
        updateData.financial_progress_in_percentage =
          (data.financial_progress / existingScheme.approved_project_cost) *
          100;
      } else {
        return {
          status: false,
          message: "Approved project cost must be a positive number.",
        };
      }
    }

    if (data.financial_progress_in_percentage !== undefined) {
      if (
        typeof data.financial_progress_in_percentage !== "number" ||
        data.financial_progress_in_percentage <= 0
      ) {
        return {
          status: false,
          message:
            "Financial progress percentage must be greater then equal to 0.",
        };
      }
      updateData.financial_progress_in_percentage =
        data.financial_progress_in_percentage;
    }

    // Log the update request details
    logger.info({
      message: `Updating scheme information for scheme ID: ${scheme_id}`,
      scheme_id,
      updateData,
      action: "updateSchemeInfo",
    });

    // Perform the update operation
    const updatedScheme = await prisma.scheme_info.update({
      where: { scheme_id },
      data: {
        ...updateData,
        updated_at: new Date(), // Set the updated_at field to the current date
      },
    });

    // Log the successful update operation
    logger.info({
      message: `Scheme updated successfully`,
      scheme_id: updatedScheme.scheme_id,
      updatedFields: updateData,
      action: "updateSchemeInfo",
    });

    return {
      status: true,
      message: "Scheme updated successfully",
      data: updatedScheme,
    };
  } catch (error) {
    console.error("Error updating scheme information:", error);
    return {
      status: false,
      message: "Error updating scheme information: " + error.message,
    };
  }
};

module.exports = {
  updateSchemeInfo,
};
