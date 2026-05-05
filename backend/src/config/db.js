const mongoose = require("mongoose");

const connectDB = async () => {
  // ถ้าเชื่อมต่ออยู่แล้วไม่ต้องต่อซ้ำ (ป้องกันปัญหาใน Serverless)
  if (mongoose.connection.readyState >= 1) return;

  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // ถ้าต่อไม่ติดใน 5 วิ ให้ Error ทันที ไม่ต้องรอจน Buffering timeout
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    // ไม่ต้อง process.exit(1) บน Vercel เพราะจะทำให้ฟังก์ชันตายถาวร
    // ให้ throw error เพื่อให้เรารู้สาเหตุใน Logs แทนครับ
    throw err;
  }
};

module.exports = connectDB;
