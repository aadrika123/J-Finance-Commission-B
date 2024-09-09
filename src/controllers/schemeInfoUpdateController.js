const { updateSchemeInfo } = require("../dao/schemeInfo/schemeInfoUpdateDao");

const modifySchemeInfo = async (req, res) => {
  try {
    const { scheme_id } = req.params;
    const data = req.body;

    const updatedSchemeInfo = await updateSchemeInfo(scheme_id, data);

    res.status(200).json(updatedSchemeInfo);
    console.log("Updating scheme with ID:", scheme_id);
    console.log("Update data:", data);
  } catch (error) {
    console.error("Error updating scheme info:", error);
    res.status(500).json({ error: "Failed to update scheme info" });
  }
};

module.exports = {
  modifySchemeInfo,
};
