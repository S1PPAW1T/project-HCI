const bucket = require("../config/firebase");
const path = require("path");

// ✅ เอาส่วน fs และการสร้างโฟลเดอร์ uploads ออกทั้งหมด เพราะ Vercel ไม่อนุญาต

exports.uploadToFirebase = async (file) => {
  if (!file || !file.buffer) {
    throw new Error("Invalid file object");
  }

  const fileName = `audio_${Date.now()}${path.extname(file.originalname)}`;

  try {
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
        // ✅ ตัดการเรียกใช้ uploadToLocal ออก เพราะบน Vercel จะพังเหมือนกัน
        reject(new Error(`Firebase upload failed: ${error.message}`));
      });

      stream.on("finish", async () => {
        try {
          console.log("✓ File uploaded to Firebase");

          // กำหนดสิทธิ์ให้ไฟล์เข้าถึงได้สาธารณะ
          await fileUpload.makePublic();

          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
          console.log("✓ Public URL:", publicUrl);
          resolve(publicUrl);
        } catch (err) {
          console.error("❌ Error making file public:", err.message);
          reject(err);
        }
      });

      stream.end(file.buffer);
    });
  } catch (error) {
    console.error("❌ Firebase operation failed:", error.message);
    throw error;
  }
};

// ✅ ลบฟังก์ชัน uploadToLocal ออก เพราะใช้ไม่ได้บน Vercel
