const {
  uploadLetter,
  getLetters,
  softDeleteLetter,
  //   sendLetter,
} = require("../../dao/letterUpload/letterUploadDao");

const uploadLetterController = async (req, res) => {
  const { ulb_id, order_number } = req.body;
  const file = req.file;

  if (!file || !ulb_id || !order_number) {
    return res
      .status(200)
      .json({ status: false, message: "Missing required fields." });
  }

  try {
    const letter_url = `./utils/fileUpload/uploads/${file.filename}`;
    const letter = await uploadLetter(ulb_id, order_number, letter_url);

    // Respond with the created letter without updated_at
    const responseLetter = {
      id: letter.id,
      ulb_id: letter.ulb_id,
      order_number: letter.order_number,
      letter_url: letter.letter_url,
      created_at: letter.created_at,
      is_active: letter.is_active,
    };

    return res.status(201).json({
      status: true,
      message: "Letter uploaded successfully",
      data: responseLetter,
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
      message: "Letter fetched successfully",
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

// const sendLetterController = async (req, res) => {
//   const { letterId, ulb_id } = req.query; // Extracting from query parameters

//   if (!letterId) {
//     return res.status(400).json({
//       status: false,
//       message: "letterId is required.",
//     });
//   }

//   try {
//     // Send the letter to specific ULB or all ULBs
//     const result = await sendLetter(
//       parseInt(letterId),
//       ulb_id ? parseInt(ulb_id) : null
//     );

//     // Send notification to specific ULB if `ulb_id` is present
//     if (ulb_id) {
//       sendNotificationToULB(ulb_id, "You received a letter");
//     } else {
//       sendNotificationToAllULBs("You received a letter");
//     }

//     return res.status(200).json({
//       status: true,
//       message: "Letter sent successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error("Error in sendLetterController:", error); // Log the full error
//     return res.status(500).json({
//       status: false,
//       message: `Failed to send letter: ${error.message}`, // Provide more details in the response
//     });
//   }
// };

module.exports = {
  uploadLetterController,
  getLettersController,
  deleteLetterController,
  //   sendLetterController,
};
