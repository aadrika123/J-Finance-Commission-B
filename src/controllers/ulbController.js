const ulbDao = require("../dao/ulb/ulbDao");

const getULBs = async (req, res) => {
  try {
    const ulbs = await ulbDao.getAllULBs();

    if (!ulbs || ulbs.length === 0) {
      return res.status(404).json({
        status: false,
        message: "No ULBs found",
      });
    }

    res.status(200).json({
      status: true,
      message: "ULBs fetched successfully",
      data: ulbs,
    });
  } catch (error) {
    console.error("Error fetching ULBs:", error);
    res.status(500).json({
      status: false,
      message: "Error fetching ULBs",
      error: error.message,
    });
  }
};

module.exports = {
  getULBs,
};
