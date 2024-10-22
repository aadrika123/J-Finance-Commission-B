const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const uploadLetter = async (ulb_id, order_number, letter_url) => {
  try {
    if (ulb_id) {
      // If a specific ULB is provided, upload only for that ULB
      return await prisma.letterUpload.create({
        data: {
          ulb_id: parseInt(ulb_id, 10),
          order_number,
          letter_url,
          is_global: false, // Specific letter, not global
        },
      });
    } else {
      // If no specific ULB, create a global letter for all ULBs
      return await prisma.letterUpload.create({
        data: {
          order_number,
          letter_url,
          is_global: true, // Global letter
        },
      });
    }
  } catch (error) {
    console.error("Error uploading the letter:", error);
    if (error.code === "P2002") {
      throw new Error("A letter with this order number already exists.");
    }
    throw new Error("An unexpected error occurred while uploading the letter.");
  }
};
const getLetters = async (inboxFilter, outboxFilter) => {
  try {
    // Fetch letters directly with filters on is_active, inbox, and outbox
    const letters = await prisma.letterUpload.findMany({
      where: {
        is_active: true,
        ...(inboxFilter && { inbox: true }), // Apply inbox filter if passed
        ...(outboxFilter && { outbox: true }), // Apply outbox filter if passed
      },
      include: {
        ULB: {
          select: {
            ulb_name: true,
          },
        },
      },
    });

    return letters;
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

const sendLetter = async (letterId, ulb_id) => {
  try {
    if (ulb_id) {
      // If a specific ULB is provided, send letter only to that ULB
      const letterUpdate = await prisma.letterUpload.update({
        where: {
          id: letterId,
        },
        data: {
          inbox: false,
          outbox: true,
        },
      });

      const description = `Letter with Order Number ${letterUpdate.order_number} has been sent to ULB ID ${ulb_id}.`;

      const notification = await prisma.notification.create({
        data: {
          description,
          ulb_id,
          letter_id: letterId,
        },
      });

      return {
        letterUpdate,
        notification,
      };
    } else {
      // If no specific ULB, send to all ULBs
      const allULBs = await prisma.uLB.findMany(); // Fetch all ULBs
      const notifications = await Promise.all(
        allULBs.map(async (ulb) => {
          const letterUpdate = await prisma.letterUpload.update({
            where: { id: letterId },
            data: { inbox: false, outbox: true },
          });

          const description = `Letter with Order Number ${letterUpdate.order_number} has been sent to all ULBs.`;

          const notification = await prisma.notification.create({
            data: {
              description,
              ulb_id: ulb.id,
              letter_id: letterId,
            },
          });

          return { letterUpdate, notification };
        })
      );
      return notifications;
    }
  } catch (error) {
    console.error("Error in sendLetter:", error);
    throw new Error(`Failed to send letter: ${error.message}`);
  }
};

const getLettersForULB = async (ulb_id) => {
  try {
    // Fetch active letters for the specific ULB or global letters where outbox is true
    const letters = await prisma.letterUpload.findMany({
      where: {
        OR: [
          { ulb_id: parseInt(ulb_id) }, // Fetch letters specific to the ULB
          { is_global: true }, // Fetch global letters
        ],
        is_active: true, // Fetch only active letters
        outbox: true, // Ensure outbox is true
      },
      include: {
        ULB: {
          select: {
            ulb_name: true,
          },
        },
      },
    });

    // Create a notification for each letter
    const notifications = await Promise.all(
      letters.map(async (letter) => {
        const description = `You received a letter with order number ${letter.order_number}`;

        // Create a notification for this letter
        const notification = await prisma.notification.create({
          data: {
            description,
            ulb_id: parseInt(ulb_id),
            letter_id: letter.id,
          },
        });

        return {
          notification,
          letter,
        };
      })
    );

    return notifications;
  } catch (error) {
    console.error("Error in getLettersForULB:", error); // Log the full error
    throw new Error(`Failed to fetch letters: ${error.message}`);
  }
};

module.exports = {
  uploadLetter,
  getLetters,
  softDeleteLetter,
  sendLetter,
  getLettersForULB,
};
