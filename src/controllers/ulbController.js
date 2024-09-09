const ulbDao = require("../dao/ulb/ulbDao");

const getULBs = async (req, res) => {
  try {
    const ulbs = await ulbDao.getAllULBs();
    res.status(200).json(ulbs);
  } catch (error) {
    console.error("Error fetching ULBs:", error);
    res.status(500).json({ error: "Error fetching ULBs" });
  }
};

module.exports = {
  getULBs,
};
