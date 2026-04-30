const Audio = require("../models/user.model");
const storageService = require("../services/storage.service");

exports.uploadAudio = async (req, res, next) => {
  try {
    const { name, age } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // upload ไป Firebase
    const audioUrl = await storageService.uploadToFirebase(file);

    // save ลง MongoDB
    const audio = await Audio.create({
      name,
      age,
      audioUrl,
    });

    res.json(audio);
  } catch (err) {
    next(err);
  }
};
