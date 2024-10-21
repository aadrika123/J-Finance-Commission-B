const {
  uploadLetter,
  getLetters,
  softDeleteLetter,
  sendLetter,
  getLettersForULB,
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
    const letter_url = `../../middlewares/utils/fileUpload/uploads/${file.filename}`;
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
    return res.status(500).json({ message: "Failed to upload letter." });
  }
};
const getLettersController = async (req, res) => {
  try {
    const letters = await getLetters();

    // Prepare response letters with both created_at and updated_at
    const responseLetters = letters.map((letter) => ({
      id: letter.id,
      ulb_id: letter.ulb_id,
      order_number: letter.order_number,
      letter_url: letter.letter_url,
      created_at: letter.created_at,
      updated_at: letter.updated_at,
      is_active: letter.is_active,
      ULB: letter.ULB,
    }));

    return res.status(200).json({
      status: true,
      message: "Letters fetched successfully",
      data: responseLetters,
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
    return res.status(400).json({
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
    return res.status(500).json({
      status: false,
      message: `Failed to send letter: ${error.message}`,
    });
  }
};

const getLettersForULBController = async (req, res) => {
  const ulb_id = req.body?.auth?.ulb_id; // Use req.body.auth.ulb_id for multi-ULB login

  if (!ulb_id) {
    return res.status(403).json({ message: "Unauthorized access." });
  }

  try {
    const result = await getLettersForULB(ulb_id);

    return res.status(200).json({
      status: true,
      message: "Letters fetched successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error in getLettersForULBController:", error);
    return res.status(500).json({
      status: false,
      message: `Failed to fetch letters: ${error.message}`,
    });
  }
};

module.exports = {
  uploadLetterController,
  getLettersController,
  deleteLetterController,
  sendLetterController,
  getLettersForULBController,
};
