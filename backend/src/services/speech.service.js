const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Transcribe from file path (existing method)
exports.transcribe = async (filePath) => {
  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-1",
  });

  fs.unlinkSync(filePath); // Delete file after use

  return response.text;
};

// Transcribe from buffer (new method for streaming)
exports.transcribeFromBuffer = async (buffer, fileName = "audio.wav") => {
  try {
    // Create a temporary file
    const tempDir = path.join(__dirname, "../../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `${Date.now()}_${fileName}`);

    // Write buffer to temporary file
    fs.writeFileSync(tempFilePath, buffer);

    // Transcribe
    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
    });

    // Delete temp file
    fs.unlinkSync(tempFilePath);

    return response.text;
  } catch (error) {
    console.error("Transcription error:", error);
    throw new Error(`Speech-to-text failed: ${error.message}`);
  }
};

// Google Cloud Speech-to-Text (Removed)
// Deepgram Speech-to-Text (Removed)

// OpenAI Whisper API - Main transcription method
exports.transcribeWithWhisper = async (buffer, fileName = "audio.wav") => {
  try {
    console.log("🔄 Transcribing with OpenAI Whisper API...");

    const tempDir = path.join(__dirname, "../../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `${Date.now()}_${fileName}`);
    fs.writeFileSync(tempFilePath, buffer);

    const response = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      language: "en",
    });

    fs.unlinkSync(tempFilePath);

    console.log("✓ Whisper transcription complete");
    return response.text || "[No speech detected]";
  } catch (error) {
    console.error("❌ Whisper transcription failed:", error.message);
    return `[Whisper Error: ${error.message}]`;
  }
};

// Transcribe with Whisper (single model)
exports.transcribeWithAllModels = async (buffer, fileName = "audio.wav") => {
  console.log("🚀 Starting transcription with OpenAI Whisper API...");

  const whisperResult = await Promise.resolve(
    exports.transcribeWithWhisper(buffer, fileName),
  );

  return {
    whisper: whisperResult,
    timestamp: new Date().toISOString(),
  };
};
