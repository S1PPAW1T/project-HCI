const mongoose = require("mongoose");

const professorSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
    unique: true,
  },
  progress: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Professor", professorSchema);