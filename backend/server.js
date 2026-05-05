require("dotenv").config();

const connectDB = require("./src/config/db");
connectDB();

const app = require("./src/app");

const PORT = process.env.PORT || 5000;

// For Vercel Serverless
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // Local development
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
