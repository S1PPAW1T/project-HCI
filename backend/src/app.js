// 🛠️ โหลดตัวแปร .env เฉพาะตอนรันบนเครื่องตัวเอง (Vercel จะข้ามขั้นตอนนี้)
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const path = require("path");

const audioRoutes = require("./routes/audio.routes");
const speechRoutes = require("./routes/speech.routes");
const userRoutes = require("./routes/user.routes");
const healthRoutes = require("./routes/health.routes");
const professorRoutes = require("./routes/professor.routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

// 🚀 1. แก้ไข CORS ป้องกันปัญหา Blocked by CORS policy บน Vercel
app.use(
  cors({
    origin: "*", // อนุญาตให้ทุกเว็บยิง API มาได้ (ปรับเป็น "http://localhost:3000" เพื่อความปลอดภัยได้)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
  }),
);

// 🚀 2. ดักจับ OPTIONS request (Preflight) ให้ตอบกลับโอเคทันที
app.options("*", cors());

app.use(express.json());

// Serve static files (for local audio uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.use("/api/health", healthRoutes);

app.use("/api/audio", audioRoutes);
app.use("/api/speech", speechRoutes);
app.use("/api/user", userRoutes);
app.use("/api/professor", professorRoutes);

app.use(errorHandler);

// 🚀 3. เปิดพอร์ตเซิร์ฟเวอร์เฉพาะตอนรันบนเครื่องตัวเอง
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running locally on port ${PORT}`);
  });
}

// 🔥 บรรทัดนี้สำคัญที่สุดสำหรับ Vercel ห้ามลบเด็ดขาด
module.exports = app;
