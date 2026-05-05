// src/config/db.js
const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return; // ถ้าเชื่อมต่ออยู่แล้ว ไม่ต้องต่อซ้ำ

  try {
    console.log("⏳ Connecting to MongoDB Atlas...");
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // ถ้าต่อไม่ติดใน 5 วิ ให้แจ้ง Error ทันที ไม่ต้องรอจน Buffering
    });

    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error details:", err.message);
    throw err; // ส่ง Error ต่อไปให้ Middleware จัดการ
  }
};

module.exports = connectDB;
