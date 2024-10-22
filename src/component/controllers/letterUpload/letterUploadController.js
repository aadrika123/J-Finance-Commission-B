const {
  uploadLetter,
  getLetters,
  softDeleteLetter,
  sendLetter,
  getLettersForULB,
  getNotificationsByUlbId,
} = require("../../dao/letterUpload/letterUploadDao");

const uploadLetterController = async (req, res) => {
  const { ulb_id, order_number } = req.body;
  const file = req.file;

  if (!file || !order_number) {
    return res
      .status(200)
      .json({ status: false, message: "Missing required fields." });
  }

  try {
    const letter_url = `${req.protocol}://${req.get("host")}/uploads/${
      file.filename
    }`;
    const letter = await uploadLetter(ulb_id, order_number, letter_url);

    return res.status(201).json({
      status: true,
      message: ulb_id
        ? "Letter uploaded to specific ULB"
        : "Global letter uploaded to all ULBs",
      data: letter,
    });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ message: "Failed to upload letter." });
  }
};

const getLettersController = async (req, res) => {
  const { page = 1, limit = 10, inbox, outbox } = req.query; // Default values
  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const offset = (pageNumber - 1) * pageSize; // Calculate offset

  try {
    // Pass the inbox and outbox filters to the DAO
    const letters = await getLetters(inbox === "true", inbox === "false"); // Convert string to boolean

    // Apply pagination in memory
    const paginatedLetters = letters.slice(offset, offset + pageSize);

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
      ULB: letter.ULB ? letter.ULB.ulb_name : "Unknown ULB", // Handle missing ULB
    }));

    // Total number of letters
    const totalLetters = letters.length;

    // Calculate if there is a next or previous page
    const hasNextPage = offset + pageSize < totalLetters;
    const hasPrevPage = pageNumber > 1;

    return res.status(200).json({
      status: true,
      message: "Letters fetched successfully",
      data: responseLetters,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: totalLetters, // Total count of letters
        next: hasNextPage ? pageNumber + 1 : null, // Provide next page number if available
        prev: hasPrevPage ? pageNumber - 1 : null, // Provide previous page number if available
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(200)
      .json({ status: false, message: "Failed to fetch letters." });
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

    return res.status(200).json({
      status: true,
      message: ulb_id
        ? "Letter sent to specific ULB"
        : "Letter sent to all ULBs",
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
  const { page = 1, limit = 10, ulb_id } = req.query; // Get ulb_id from query
  const pageNumber = parseInt(page);
  const pageSize = parseInt(limit);
  const offset = (pageNumber - 1) * pageSize; // Calculate offset

  const authenticatedUlbId = req.body?.auth?.ulb_id; // Get ulb_id from request body

  if (String(authenticatedUlbId) !== ulb_id) {
    return res.status(200).json({ message: "Unauthorized access." });
  }

  if (!ulb_id) {
    return res.status(200).json({ message: "Ulb id required !" });
  }

  try {
    const result = await getLettersForULB(ulb_id); // Get all letters for the specific ULB

    // Apply pagination in memory
    const paginatedLetters = result.slice(offset, offset + pageSize);

    // Prepare response data
    const responseData = paginatedLetters.map((item) => {
      return {
        id: item.letter.id,
        ulb_id: item.letter.ulb_id || null,
        order_number: item.letter.order_number || "Unknown Order Number",
        letter_url: item.letter.letter_url || null,
        created_at: item.letter.created_at,
        updated_at: item.letter.updated_at,
        is_active: item.letter.is_active,
        is_global: item.letter.is_global,
        inbox: item.letter.inbox,
        outbox: item.letter.outbox,
        ULB: item.letter.ULB ? item.letter.ULB.ulb_name : "Unknown ULB",

        notification: {
          id: item.notification.id,
          description:
            item.notification.description ||
            `You received a letter with order number ${item.letter.order_number}`,
          ulb_id: item.notification.ulb_id,
          letter_id: item.notification.letter_id,
          created_at: item.notification.created_at,
        },
      };
    });

    // Total number of letters
    const totalLetters = result.length;

    // Calculate if there is a next or previous page
    const hasNextPage = offset + pageSize < totalLetters;
    const hasPrevPage = pageNumber > 1;

    return res.status(200).json({
      status: true,
      message: "Letters fetched successfully, including global letters.",
      data: responseData,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total: totalLetters,
        next: hasNextPage ? pageNumber + 1 : null,
        prev: hasPrevPage ? pageNumber - 1 : null,
      },
    });
  } catch (error) {
    console.error("Error in getLettersForULBController:", error);
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

    return res.status(200).json({
      status: true,
      message: "Notifications fetched successfully.",
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
