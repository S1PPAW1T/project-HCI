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

app.use(cors());
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

module.exports = app;
