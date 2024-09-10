const {
  createSchemeInfo,
  getSchemeInfo,
} = require("../dao/schemeInfo/schemeInfoDao");

const moment = require("moment-timezone");

const addSchemeInfo = async (req, res) => {
  try {
    const {
      scheme_id,
      project_cost,
      scheme_name,
      sector,
      grant_type,
      city_type,
      date_of_approved,
      ulb,
    } = req.body;

    // Convert the input date to UTC using the Asia/Kolkata timezone
    const dateOfApprovedUTC = moment
      .tz(date_of_approved, "Asia/Kolkata")
      .utc()
      .toDate();

    // Get the current time in Asia/Kolkata timezone and convert it to UTC
    const createdAtKolkata = moment.tz("Asia/Kolkata").toDate();
    const createdAtUTC = moment(createdAtKolkata).utc().toDate();

    const newSchemeInfo = await createSchemeInfo({
      scheme_id,
      project_cost,
      scheme_name,
      sector,
      grant_type,
      city_type,
      date_of_approved: dateOfApprovedUTC,
      created_at: createdAtUTC, // Pass the UTC time to the DAO
      ulb,
    });

    res.status(201).json({
      status: true,
      message: "Scheme information created successfully",
      data: newSchemeInfo,
    });
  } catch (error) {
    console.error("Error creating scheme info:", error);
    res.status(500).json({
      status: false,
      message: "Failed to create scheme information",
      error: error.message,
    });
  }
};

const fetchSchemeInfo = async (req, res) => {
  try {
    const schemeInfoList = await getSchemeInfo();

    res.status(200).json({
      status: true,
      message: "Scheme request list fetched successfully",
      data: schemeInfoList,
    });
  } catch (error) {
    console.error("Error fetching scheme info:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch scheme request list",
      error: error.message,
    });
  }
};

module.exports = {
  addSchemeInfo,
  fetchSchemeInfo,
};
