const Audio = require("../models/audio.model");
const storageService = require("../services/storage.service");
const speechService = require("../services/speech.service");

exports.uploadAudio = async (req, res, next) => {
  try {
    const { id, task } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!id) {
      return res.status(400).json({ message: "Audio record ID is required" });
    }

    const taskNumber = parseInt(task) || 1;

    // Task 1: Upload audio to Firebase and save to MongoDB
    if (taskNumber === 1) {
      return handleTask1Upload(id, file, res, next);
    }

    // Tasks 2-5: Convert audio to text using speech-to-text
    return handleTaskSpeechToText(id, file, taskNumber, res, next);
  } catch (err) {
    next(err);
  }
};

// Task 1: Upload audio file to Firebase Storage
const handleTask1Upload = async (id, file, res, next) => {
  try {
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
      message: "Audio uploaded successfully to Firebase",
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

// Tasks 2-5: Convert audio to text using speech-to-text API
const handleTaskSpeechToText = async (id, file, taskNumber, res, next) => {
  try {
    console.log(`🎙️  Task ${taskNumber}: Converting audio to text...`);

    // Convert audio buffer to text
    const transcribedText = await speechService.transcribeFromBuffer(
      file.buffer,
      `task${taskNumber}.wav`,
    );

    console.log(
      `✓ Task ${taskNumber} transcription complete:`,
      transcribedText,
    );

    res.json({
      success: true,
      message: `Task ${taskNumber} audio converted to text`,
      task: taskNumber,
      data: {
        text: transcribedText,
        taskNumber: taskNumber,
      },
    });
  } catch (err) {
    console.error(`❌ Task ${taskNumber} transcription failed:`, err.message);
    next(err);
  }
};
