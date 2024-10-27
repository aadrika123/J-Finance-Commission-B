const {
  uploadLetter,
  getLetters,
  softDeleteLetter,
  sendLetter,
  getLettersForULB,
  getNotificationsByUlbId,
} = require("../../dao/letterUpload/letterUploadDao");
const logger = require("../../../utils/log/logger");
const createAuditLog = require("../../../utils/auditLog/auditLogger");
const {
  imageUploaderV2,
} = require("../../../utils/fileUpload/uploads/imageUploaderV2");

const uploadLetterController = async (req, res) => {
  const { ulb_id, order_number } = req.body;
  const file = req.file;

  if (!file || !order_number) {
    return res
      .status(200)
      .json({ status: false, message: "Missing required fields." });
  }

  try {
    // Use imageUploaderV2 to upload the file and get the URL
    const letterUrlList = await imageUploaderV2([file]);
    const letter_url = letterUrlList[0]; // Get the URL of the first file

    if (!letter_url) {
      throw new Error("File upload failed. No URL returned.");
    }

    // Save the letter info to the database
    const letter = await uploadLetter(ulb_id, order_number, letter_url);

    // Create an audit log entry
    await createAuditLog(
      req.body?.auth?.id, // userId, assuming auth data in req.body
      "CREATE",
      "LetterUpload",
      letter?.id || null,
      { ulb_id, order_number, letter_url }
    );

    return res.status(201).json({
      status: true,
      message: ulb_id
        ? "Letter uploaded to specific ULB"
        : "Global letter uploaded to all ULBs",
      data: letter,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to upload letter.", error });
  }
};

// const uploadLetterController = async (req, res) => {
//   const { ulb_id, order_number } = req.body;
//   const file = req.file;

//   if (!file || !order_number) {
//     return res
//       .status(200)
//       .json({ status: false, message: "Missing required fields." });
//   }

//   try {
//     // const letter_url = `${req.protocol}://${req.get("host")}/uploads/${
//     //   file.filename
//     // }`;
//     const letter_url = `${process.env.SERVER_URL}/uploads/${file.filename}`;
//     const letter = await uploadLetter(ulb_id, order_number, letter_url);

//     // Create an audit log entry
//     await createAuditLog(
//       req.body?.auth?.id, // userId, assuming auth data in req.body
//       "CREATE", // actionType, since a new letter is being uploaded
//       "LetterUpload", // tableName for letters
//       letter?.id || null, // recordId, using the letter ID
//       { ulb_id, order_number, letter_url } // changedData, containing uploaded letter details
//     );

//     return res.status(201).json({
//       status: true,
//       message: ulb_id
//         ? "Letter uploaded to specific ULB"
//         : "Global letter uploaded to all ULBs",
//       data: letter,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(200).json({ message: "Failed to upload letter." });
//   }
// };
const getLettersController = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP

  try {
    const userId = req.body?.auth?.id || null;
    const page = parseInt(req.query.page, 10) || 1; // Current page number
    const take = parseInt(req.query.limit, 10) || 10; // Number of records per page
    const skip = (page - 1) * take; // Calculate offset

    const { inbox, outbox } = req.query; // Optional filters

    // Pass the inbox and outbox filters to the DAO
    const letters = await getLetters(inbox === "true", inbox === "false"); // Convert string to boolean

    // Apply pagination in memory
    const paginatedLetters = letters.slice(skip, skip + take);

    // Prepare response letters with both created_at and updated_at
    const responseLetters = paginatedLetters.map((letter) => ({
      id: letter.id,
      ulb_id: letter.ulb_id || null, // Add null check for ulb_id
      order_number: letter.order_number,
      letter_url: letter.letter_url,
      inbox: letter.inbox,
      outbox: letter.outbox,
      created_at: letter.created_at,
      updated_at: letter.updated_at,
      is_active: letter.is_active,
      ULB: letter.ULB ? letter.ULB.ulb_name : "All ULBs", // Handle missing ULB
    }));

    // Total number of letters
    const totalLetters = letters.length;

    // Calculate pagination details
    const totalPage = Math.ceil(totalLetters / take);
    const nextPage = page < totalPage ? page + 1 : null;
    const hasPrevPage = page > 1;

    // Log the successful fetch of letters
    logger.info("Letters fetched successfully", {
      userId,
      action: "FETCH_LETTERS",
      ip: clientIp,
      page,
      take,
      totalLetters,
    });

    return res.status(200).json({
      status: true,
      message: "Letters fetched successfully",
      data: responseLetters,
      pagination: {
        next: nextPage, // Provide next page number if available
        currentPage: page,
        currentTake: take,
        totalPage,
        totalResult: totalLetters, // Total count of letters
      },
    });
  } catch (error) {
    logger.error("Error fetching letters", {
      userId,
      action: "FETCH_LETTERS",
      ip: clientIp,
      error: error.message,
    });
    return res.status(200).json({
      status: false,
      message: "Failed to fetch letters.",
      error: error.message,
    });
  }
};

const deleteLetterController = async (req, res) => {
  const { id } = req.params;

  try {
    const letter = await softDeleteLetter(id);

    // Prepare the response with all fields except created_at
    const responseLetter = {
      id: letter.id,
      ulb_id: letter.ulb_id,
      order_number: letter.order_number,
      letter_url: letter.letter_url,
      updated_at: letter.updated_at, // Include updated_at after the soft delete
      is_active: letter.is_active,
    };

    // Create an audit log entry for the delete action
    await createAuditLog(
      req.body?.auth?.id, // userId, assuming auth data is available in req.body
      "DELETE", // actionType, since the letter is being deleted
      "LetterUpload", // tableName for the letter uploads
      id, // recordId, using the letter ID being deleted
      responseLetter // changedData, logging the soft-deleted letter details
    );

    return res.status(200).json({
      status: true,
      message: "Letter deleted successfully",
      data: responseLetter,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(200)
      .json({ status: false, message: "Failed to delete letter." });
  }
};

const sendLetterController = async (req, res) => {
  const { letterId, ulb_id } = req.body;

  if (!letterId) {
    return res.status(200).json({
      status: false,
      message: "letterId is required.",
    });
  }

  try {
    const result = await sendLetter(
      parseInt(letterId),
      ulb_id ? parseInt(ulb_id) : null
    );

    // Create an audit log entry for the send letter action
    await createAuditLog(
      req.body?.auth?.id, // userId, assuming auth data is available in req.body
      "SEND", // actionType, since the letter is being sent
      "LetterUpload", // tableName for the letter uploads
      letterId, // recordId, using the ID of the letter being sent
      { letterId, ulb_id } // changedData, logging the letterId and ulb_id details
    );

    return res.status(200).json({
      status: true,
      message: ulb_id
        ? "Letter sent to specific ULB and notification created."
        : "Letter sent to all ULBs and notifications created.",
      data: result,
    });
  } catch (error) {
    console.error("Error in sendLetterController:", error);
    return res.status(200).json({
      status: false,
      message: `Failed to send letter: ${error.message}`,
    });
  }
};

const getLettersForULBController = async (req, res) => {
  const clientIp = req.headers["x-forwarded-for"] || req.ip; // Capture IP

  const { page = 1, limit = 10, ulb_id } = req.query; // Get ulb_id from query
  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const skip = (pageNumber - 1) * pageSize; // Calculate offset

  const authenticatedUlbId = req.body?.auth?.ulb_id; // Get ulb_id from request body
  // const authenticatedUlbId = 2; // Mock authenticatedUlbId for now

  if (String(authenticatedUlbId) !== ulb_id) {
    return res
      .status(200)
      .json({ status: false, message: "Unauthorized access." });
  }

  if (!ulb_id) {
    return res.status(200).json({ status: false, message: "Ulb id required!" });
  }

  try {
    const result = await getLettersForULB(ulb_id); // Get all letters for the specific ULB

    if (!result || result.length === 0) {
      return res.status(200).json({
        status: false,
        message: "No letters found for this ULB.",
        data: [],
      });
    }

    // Apply pagination in memory
    const paginatedLetters = result.slice(skip, skip + pageSize);

    // Prepare response data
    const responseData = paginatedLetters.map((item) => {
      const letter = item || {}; // Ensure letter exists
      const notification = Array.isArray(item.notification)
        ? item.notification[0]
        : {}; // Access the first notification if it exists

      return {
        id: letter.id || null, // Fetch letter id
        ulb_id: letter.ulb_id || null, // Fetch ULB id
        order_number: letter.order_number || "Unknown Order Number", // Provide fallback
        letter_url: letter.letter_url || null,
        created_at: letter.created_at,
        updated_at: letter.updated_at,
        is_active: letter.is_active,
        is_global: letter.is_global,
        inbox: letter.inbox,
        outbox: letter.outbox,
        ULB: letter.ULB ? letter.ULB.ulb_name : "All ULBs", // Handle null ULB

        notification: {
          id: notification?.id || null, // Handle null notification id
          description:
            notification?.description ||
            `You received a letter with order number ${
              letter.order_number || "Unknown"
            }`, // Handle null description
          ulb_id: notification?.ulb_id,
          letter_id: notification?.letter_id,
          created_at: notification?.created_at,
        },
      };
    });

    // Total number of letters
    const totalLetters = result.length;

    // Calculate pagination details
    const totalPage = Math.ceil(totalLetters / pageSize);
    const nextPage = pageNumber < totalPage ? pageNumber + 1 : null;
    const hasPrevPage = pageNumber > 1;

    // Log the successful fetch of letters
    logger.info("Letters for ULB fetched successfully", {
      authenticatedUlbId,
      action: "FETCH_LETTERS_FOR_ULB",
      ip: clientIp,
      page: pageNumber,
      limit: pageSize,
      totalLetters,
    });

    return res.status(200).json({
      status: true,
      message: "Letters fetched successfully, including global letters.",
      data: responseData,
      pagination: {
        next: nextPage,
        currentPage: pageNumber,
        currentTake: pageSize,
        totalPage,
        totalResult: totalLetters, // Total count of letters
      },
    });
  } catch (error) {
    logger.error("Error in getLettersForULBController:", {
      error: error.message,
      authenticatedUlbId,
      action: "FETCH_LETTERS_FOR_ULB",
      ip: clientIp,
    });
    return res.status(200).json({
      status: false,
      message: `Failed to fetch letters: ${error.message}`,
      data: [],
    });
  }
};

const getNotificationsController = async (req, res) => {
  const { ulb_id } = req.query; // Get ulb_id from query parameters

  const authenticatedUlbId = req.body?.auth?.ulb_id; // Get ulb_id from request body
  // const authenticatedUlbId = 2;

  if (String(authenticatedUlbId) !== ulb_id) {
    return res.status(200).json({ message: "Unauthorized access." });
  }

  if (!ulb_id) {
    return res
      .status(200)
      .json({ status: false, message: "ulb_id is required." });
  }

  try {
    const notifications = await getNotificationsByUlbId(ulb_id); // Fetch notifications from DAO

    // Prepare response data
    const responseData = notifications.map((notification) => ({
      id: notification.id,
      description: notification.description,
      ulb_id: notification.ulb_id,
      letter_id: notification.letter_id,
      created_at: notification.created_at,
      letter_url: notification.LetterUpload.letter_url || null, // Access letter_url
    }));

    const totalNotificationCount = notifications.length; // Calculate total number of notifications

    return res.status(200).json({
      status: true,
      message: "Notifications fetched successfully.",
      totalNotificationCount, // Include total count of notifications in response
      data: responseData,
    });
  } catch (error) {
    console.error("Error in getNotificationsController:", error);
    return res.status(200).json({
      status: false,
      message: `Failed to fetch notifications: ${error.message}`,
      data: [],
    });
  }
};

module.exports = {
  uploadLetterController,
  getLettersController,
  deleteLetterController,
  sendLetterController,
  getLettersForULBController,
  getNotificationsController,
};
