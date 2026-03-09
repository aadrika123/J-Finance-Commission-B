const crypto = require("crypto");
const axios = require("axios");
const FormData = require("form-data");

const imageUploaderV2 = async (file) => {
  const token = process.env.DMS_TOKEN;
  const toReturn = [];
  try {
    await Promise.all(
      file.map(async (item) => {
        const hashed = crypto
          .createHash("SHA256")
          .update(item.buffer)
          .digest("hex");
        const formData = new FormData();
        formData.append("file", item.buffer, item.mimetype);
        formData.append("tags", item.originalname.substring(0, 7));
        // Optional metadata support
      if ((item ).is_global_master) {
        formData.append("is_global_master", "true");
      } else if ((item ).ulb_id && !(item ).module_id) {
        formData.append("ulb_id", (item ).ulb_id);
      } else if ((item ).ulb_id && (item ).module_id) {
        formData.append("ulb_id", (item ).ulb_id);
        formData.append("module_id", (item ).module_id);
      }

        const headers = {
          "x-digest": hashed,
          token: token,
          folderPathId: 1,
          ...formData.getHeaders(),
        };

        await axios
          .post(process.env.DMS_UPLOAD || "", formData, { headers })
          .then(async (response) => {
            const getUrlHeaders = {
              token:token,
            };
            await axios
              .post(
                process.env.DMS_GET || "",
                { referenceNo: response.data.data.ReferenceNo },
                { headers: getUrlHeaders }
              )
              .then((res) => {
                toReturn.push(res.data.data.fullPath);
              })
              .catch((err) => {
                throw err;
              });
          })
          .catch((err) => {
            throw err;
          });
      })
    );
  } catch (err) {
    throw err;
  }
  return toReturn;
};

module.exports = { imageUploaderV2 };
