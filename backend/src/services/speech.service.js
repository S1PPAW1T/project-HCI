const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const speech = require("@google-cloud/speech");
const { DeepgramClient } = require("@deepgram/sdk");
const axios = require("axios");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const googleClient = new speech.SpeechClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || "./serviceAccountKey.json",
});

const deepgram = new DeepgramClient({
  apiKey: process.env.DEEPGRAM_API_KEY || "",
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

// Google Cloud Speech-to-Text
exports.transcribeWithGoogle = async (buffer, fileName = "audio.wav") => {
  try {
    console.log("🔄 Transcribing with Google Cloud Speech-to-Text...");

    const audio = {
      content: buffer.toString("base64"),
    };

    const config = {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      languageCode: "en-US",
      model: "latest_long",
      useEnhanced: true,
    };

    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await googleClient.recognize(request);
    const transcription = response.results
      .map((result) => result.alternatives[0].transcript)
      .join("\n");

    console.log("✓ Google Cloud transcription complete");
    return transcription || "[No speech detected]";
  } catch (error) {
    console.error("❌ Google Cloud transcription failed:", error.message);
    return `[Google Cloud Error: ${error.message}]`;
  }
};

// OpenAI Whisper via buffer
const { exec } = require("child_process");

exports.transcribeWithWhisperLocal = async (buffer, fileName = "audio.wav") => {
  try {
    console.log("🔄 Transcribing with Whisper LOCAL...");

    const tempDir = path.join(__dirname, "../../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `${Date.now()}_${fileName}`);
    fs.writeFileSync(tempFilePath, buffer);

    const result = await new Promise((resolve, reject) => {
      exec(`python3 whisper_local.py ${tempFilePath}`, (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve(stdout);
      });
    });

    fs.unlinkSync(tempFilePath);

    console.log("✓ Whisper LOCAL transcription complete");
    return result.trim() || "[No speech detected]";
  } catch (error) {
    console.error("❌ Whisper LOCAL failed:", error.message);
    return `[Whisper Local Error: ${error.message}]`;
  }
};

// Deepgram Speech-to-Text
exports.transcribeWithDeepgram = async (buffer, fileName = "audio.wav") => {
  try {
    console.log("🔄 Transcribing with Deepgram...");

    if (!process.env.DEEPGRAM_API_KEY) {
      console.warn("⚠️ Deepgram API key not configured, skipping...");
      return "[Deepgram API key not configured]";
    }

    // Use REST API instead of SDK
    const response = await axios.post(
      'https://api.deepgram.com/v1/listen',
      buffer,
      {
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/wav',
        },
        params: {
          model: 'nova-2',
          language: 'en',
          punctuate: true,
        },
      }
    );

    const transcript = response.data?.results?.channels[0]?.alternatives[0]?.transcript;

    console.log("✓ Deepgram transcription complete");
    return transcript || "[No speech detected]";
  } catch (error) {
    console.error("❌ Deepgram transcription failed:", error.message);
    return `[Deepgram Error: ${error.response?.data?.error || error.message}]`;
  }
};

// Transcribe with all 3 models in parallel
exports.transcribeWithAllModels = async (buffer, fileName = "audio.wav") => {
  console.log("🚀 Starting parallel transcription with all 3 models...");

  const [googleResult, whisperResult, deepgramResult] = await Promise.allSettled([
    exports.transcribeWithGoogle(buffer, fileName),
    exports.transcribeWithWhisperLocal(buffer, fileName), // 👈 เปลี่ยนตรงนี้
    exports.transcribeWithDeepgram(buffer, fileName),
  ]);

  return {
    google: googleResult.status === 'fulfilled' ? googleResult.value : `[Google Error]`,
    whisper: whisperResult.status === 'fulfilled' ? whisperResult.value : `[Whisper Error]`,
    deepgram: deepgramResult.status === 'fulfilled' ? deepgramResult.value : `[Deepgram Error]`,
    timestamp: new Date().toISOString(),
  };
};
