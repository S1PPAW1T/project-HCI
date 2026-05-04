require("dotenv").config();

const connectDB = require("./src/config/db");
connectDB();

const app = require("./src/app");

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
