const express = require("express");
const cors = require("cors");

const audioRoutes = require("./routes/audio.routes");
const speechRoutes = require("./routes/speech.routes");
const userRoutes = require("./routes/user.routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/audio", audioRoutes);
app.use("/api/speech", speechRoutes);
app.use("/api/user", userRoutes);

app.use(errorHandler);

module.exports = app;
