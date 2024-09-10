const { updateSchemeInfo } = require("../dao/schemeInfo/schemeInfoUpdateDao");

const modifySchemeInfo = async (req, res) => {
  try {
    const { scheme_id } = req.params;
    const data = req.body;

    const updatedSchemeInfo = await updateSchemeInfo(scheme_id, data);

    if (!updatedSchemeInfo) {
      return res.status(404).json({
        status: false,
        message: `Scheme with ID ${scheme_id} not found`,
      });
    }

    res.status(200).json({
      status: true,
      message: "Scheme info updated successfully",
      data: updatedSchemeInfo,
    });

    console.log("Updating scheme with ID:", scheme_id);
    console.log("Update data:", data);
  } catch (error) {
    console.error("Error updating scheme info:", error);
    res.status(500).json({
      status: false,
      message: "Failed to update scheme info",
      error: error.message,
    });
  }
};

module.exports = {
  modifySchemeInfo,
};
