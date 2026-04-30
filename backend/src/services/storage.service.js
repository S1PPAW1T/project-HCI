const bucket = require("../config/firebase");
const path = require("path");

exports.uploadToFirebase = async (file) => {
  const fileName = Date.now() + path.extname(file.originalname);

  const fileUpload = bucket.file(fileName);

  const stream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    stream.on("error", reject);

    stream.on("finish", async () => {
      await fileUpload.makePublic();

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      resolve(publicUrl);
    });

    stream.end(file.buffer);
  });
};
