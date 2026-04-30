const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload.middleware");
const audioController = require("../controllers/audio.controller");

router.post("/upload", upload.single("audio"), audioController.uploadAudio);

module.exports = router;
