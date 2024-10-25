const crypto = require("crypto");
const axios = require("axios");
const FormData = require("form-data");

const imageUploaderV2 = async (file) => {
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

        const headers = {
          "x-digest": hashed,
          token: "8Ufn6Jio6Obv9V7VXeP7gbzHSyRJcKluQOGorAD58qA1IQKYE0",
          folderPathId: 1,
          ...formData.getHeaders(),
        };

        await axios
          .post(process.env.DMS_UPLOAD || "", formData, { headers })
          .then(async (response) => {
            const getUrlHeaders = {
              token: "8Ufn6Jio6Obv9V7VXeP7gbzHSyRJcKluQOGorAD58qA1IQKYE0",
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
