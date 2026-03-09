const crypto = require("crypto");
const axios = require("axios");
const FormData = require("form-data");

const imageUploaderV2 = async (files) => {
  const token = process.env.DMS_TOKEN;
  const toReturn = [];

  if (!files || files.length === 0) {
    throw new Error("No files provided for upload.");
  }

  try {
    await Promise.all(
      files.map(async (item) => {

        if (!item.buffer || !item.originalname || !item.mimetype) {
          throw new Error("Invalid file structure.");
        }

        const hashed = crypto
          .createHash("sha256")
          .update(item.buffer)
          .digest("hex");

        const formData = new FormData();

        formData.append("file", item.buffer, {
          filename: item.originalname,
          contentType: item.mimetype,
        });

        formData.append("tags", item.originalname.substring(0, 7));

        // Optional metadata
        if (item.is_global_master) {
          formData.append("is_global_master", "true");
        } else if (item.ulb_id && !item.module_id) {
          formData.append("ulb_id", item.ulb_id);
        } else if (item.ulb_id && item.module_id) {
          formData.append("ulb_id", item.ulb_id);
          formData.append("module_id", item.module_id);
        }

        const headers = {
          token: token,
          "x-digest": hashed,
          ...formData.getHeaders(),
        };

        // Upload to DMS
        const uploadResponse = await axios.post(
          process.env.DMS_UPLOAD,
          formData,
          { headers }
        );

        const referenceNo = uploadResponse?.data?.data?.ReferenceNo;

        if (!referenceNo) {
          throw new Error("ReferenceNo not returned from DMS.");
        }

        // Get file URL
        const getResponse = await axios.post(
          process.env.DMS_GET,
          { referenceNo },
          { headers: { token } }
        );

        const fullPath = getResponse?.data?.data?.fullPath;

        if (fullPath) {
          toReturn.push(fullPath);
        } else {
          throw new Error("Failed to retrieve file URL.");
        }

      })
    );

    return toReturn;

  } catch (err) {
    console.error("DMS Upload Error:", err?.response?.data || err.message);
    throw err;
  }
};

module.exports = { imageUploaderV2 };