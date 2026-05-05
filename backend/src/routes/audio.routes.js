const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload.middleware");
const audioController = require("../controllers/audio.controller");

router.post("/upload", upload.single("audio"), audioController.uploadAudio);
router.get("/:id/evaluations", audioController.getEvaluations);
router.post("/:id/ratings", audioController.saveRatings);

module.exports = router;
