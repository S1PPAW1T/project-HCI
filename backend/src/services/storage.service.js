const bucket = require("../config/firebase");
const path = require("path");
const fs = require("fs");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Try Firebase first, fallback to local storage
exports.uploadToFirebase = async (file) => {
  if (!file || !file.buffer) {
    throw new Error("Invalid file object");
  }

  const fileName = `audio_${Date.now()}${path.extname(file.originalname)}`;

  try {
    // Try Firebase upload
    console.log("🔄 Attempting Firebase upload...");
    console.log("   Bucket:", bucket.name);
    console.log("   File:", fileName);

    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
      resumable: false,
    });

    return new Promise((resolve, reject) => {
      stream.on("error", (error) => {
        console.error("❌ Firebase upload failed:", error.message);
        console.log("⚠️  Falling back to local storage...");

        // Fallback to local storage
        uploadToLocal(file, fileName).then(resolve).catch(reject);
      });

      stream.on("finish", async () => {
        try {
          console.log("✓ File uploaded to Firebase");
          await fileUpload.makePublic();

          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          console.log("✓ Public URL:", publicUrl);
          resolve(publicUrl);
        } catch (err) {
          console.error("❌ Error making file public:", err.message);
          console.log("⚠️  Falling back to local storage...");

          uploadToLocal(file, fileName).then(resolve).catch(reject);
        }
      });

      stream.end(file.buffer);
    });
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error.message);
    console.log("⚠️  Using local storage fallback...");
    return uploadToLocal(file, fileName);
  }
};

// Local storage fallback
const uploadToLocal = async (file, fileName) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFile(filePath, file.buffer, (err) => {
      if (err) {
        console.error("❌ Local storage failed:", err.message);
        reject(err);
      } else {
        const publicUrl = `${process.env.API_URL || "http://localhost:5000"}/uploads/${fileName}`;
        console.log("✓ File saved locally");
        console.log("✓ URL:", publicUrl);
        resolve(publicUrl);
      }
    });
  });
};
