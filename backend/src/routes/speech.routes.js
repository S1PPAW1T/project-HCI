const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload.middleware");
const speechController = require("../controllers/speech.controller");

router.post(
  "/transcribe",
  upload.single("audio"),
  speechController.speechToText,
);

module.exports = router;
