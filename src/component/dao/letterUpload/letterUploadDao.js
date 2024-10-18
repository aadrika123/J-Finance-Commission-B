const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const uploadLetter = async (ulb_id, order_number, letter_url) => {
  try {
    return await prisma.letterUpload.create({
      data: {
        ulb_id: parseInt(ulb_id, 10),
        order_number,
        letter_url,
      },
    });
  } catch (error) {
    console.error("Error uploading the letter:", error); // Log the full error for debugging
    if (error.code === "P2002") {
      // Unique constraint failed
      throw new Error("A letter with this order number already exists.");
    }
    throw new Error("An unexpected error occurred while uploading the letter.");
  }
};

const getLetters = async () => {
  try {
    return await prisma.letterUpload.findMany({
      where: {
        is_active: true,
      },
      include: {
        ULB: {
          select: {
            ulb_name: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching letters:", error); // Log the full error for debugging
    throw new Error("An unexpected error occurred while fetching letters.");
  }
};

const softDeleteLetter = async (id) => {
  try {
    return await prisma.letterUpload.update({
      where: {
        id: parseInt(id, 10),
      },
      data: {
        is_active: false,
      },
    });
  } catch (error) {
    console.error("Error soft-deleting the letter:"); // Log the full error for debugging
    if (error.code === "P2025") {
      // Record not found
      throw new Error("The letter you are trying to delete does not exist.");
    }
    throw new Error("An unexpected error occurred while deleting the letter.");
  }
};

// const sendLetter = async (letterId, ulb_id) => {
//   try {
//     if (ulb_id) {
//       // Sending to specific ULB
//       return await prisma.letterUpload.updateMany({
//         where: {
//           id: letterId,
//           ulb_id: ulb_id, // Ensure it updates for the specified ULB
//         },
//         data: {
//           outbox: true,
//         },
//       });
//     } else {
//       // Sending to all ULBs for this letter
//       return await prisma.letterUpload.updateMany({
//         where: {
//           id: letterId,
//         },
//         data: {
//           outbox: true,
//         },
//       });
//     }
//   } catch (error) {
//     console.error("Error in sendLetter:", error); // Log the full error
//     throw new Error(`Failed to send letter: ${error.message}`);
//   }
// };

module.exports = {
  uploadLetter,
  getLetters,
  softDeleteLetter,
  //   sendLetter,
};
