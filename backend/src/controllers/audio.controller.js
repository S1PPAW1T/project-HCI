const Audio = require("../models/audio.model");
const storageService = require("../services/storage.service");

exports.uploadAudio = async (req, res, next) => {
  try {
    const { id } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!id) {
      return res.status(400).json({ message: "Audio record ID is required" });
    }

    // Find the existing Audio record
    const audio = await Audio.findById(id);

    if (!audio) {
      return res.status(404).json({ message: "Audio record not found" });
    }

    // Check if audio has already been uploaded (only allow first recording)
    if (audio.audioUrl) {
      return res.status(400).json({
        message: "Audio already uploaded. Only the first recording is saved.",
      });
    }

    // Upload to Firebase
    const audioUrl = await storageService.uploadToFirebase(file);

    // Update the record with audioUrl
    audio.audioUrl = audioUrl;
    await audio.save();

    // Return the complete record
    res.json({
      success: true,
      message: "Audio uploaded successfully",
      data: {
        name: audio.name,
        age: audio.age,
        audioUrl: audio.audioUrl,
      },
    });
  } catch (err) {
    next(err);
  }
};
