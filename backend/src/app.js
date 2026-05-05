// 🛠️ โหลดตัวแปร .env เฉพาะตอนรันบนเครื่องตัวเอง
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

// 🚀 1. ปรับปรุง CORS ให้รองรับระบบใหม่
app.use(
  cors({
    origin: true, // อนุญาตให้ Origin ที่ยิงมาผ่านได้ (ยืดหยุ่นกว่า "*")
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

// 🚀 2. แก้ปัญหา PathError: เปลี่ยนจาก "*" เป็น "/(.*)"
app.options("/(.*)", cors());

app.use(express.json());

// 🚀 3. จัดการ Static Files (ปิดไว้สำหรับ Production เพราะ Vercel เป็น Read-only)
if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
}

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/audio", audioRoutes);
app.use("/api/speech", speechRoutes);
app.use("/api/user", userRoutes);
app.use("/api/professor", professorRoutes);

app.use(errorHandler);

// 🚀 4. เปิดพอร์ตเซิร์ฟเวอร์เฉพาะตอนรันบนเครื่องตัวเอง (Local)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running locally on port ${PORT}`);
  });
}

// 🔥 บรรทัดนี้สำคัญที่สุดสำหรับ Vercel ห้ามลบเด็ดขาด
module.exports = app;
