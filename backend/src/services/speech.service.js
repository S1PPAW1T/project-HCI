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
