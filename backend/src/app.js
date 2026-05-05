// 🛠️ โหลดตัวแปร .env เฉพาะตอนรันบนเครื่องตัวเอง
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const connectDB = require("./config/db");
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

// 🚀 1. ตั้งค่า CORS Middleware
const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  credentials: true,
};

app.use(cors(corsOptions));

// 🚀 2. แก้ปัญหา PathError: ใช้ Middleware เช็ค Method
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return cors(corsOptions)(req, res, next);
  }
  next();
});

app.use(express.json());

// 🚀 3. จัดการ Static Files (เฉพาะ Local)
if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
}

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 🚀🚀🚀 จุดที่เพิ่ม: เรียกใช้งาน Database Connection ตรงนี้ครับ! 🚀🚀🚀
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ Middleware DB Connection Error:", err);
    res.status(500).json({ error: "Database connection failed" });
  }
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

// 🔥 สำคัญที่สุดสำหรับ Vercel
module.exports = app;
