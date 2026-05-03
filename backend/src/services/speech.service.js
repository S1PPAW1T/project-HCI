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
exports.transcribeWithWhisper = async (buffer, fileName = "audio.wav") => {
  try {
    console.log("🔄 Transcribing with OpenAI Whisper...");

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
  try {
    console.log("🚀 Starting parallel transcription with all 3 models...");

    const [googleResult, whisperResult, deepgramResult] = await Promise.allSettled([
      exports.transcribeWithGoogle(buffer, fileName),
      exports.transcribeWithWhisper(buffer, fileName),
      exports.transcribeWithDeepgram(buffer, fileName),
    ]);

    const results = {
      google: googleResult.status === 'fulfilled' ? googleResult.value : `[Google Error: ${googleResult.reason?.message}]`,
      whisper: whisperResult.status === 'fulfilled' ? whisperResult.value : `[Whisper Error: ${whisperResult.reason?.message}]`,
      deepgram: deepgramResult.status === 'fulfilled' ? deepgramResult.value : `[Deepgram Error: ${deepgramResult.reason?.message}]`,
      timestamp: new Date().toISOString(),
    };

    console.log("✓ All transcriptions complete");
    return results;
  } catch (error) {
    console.error("❌ Parallel transcription failed:", error.message);
    throw new Error(`Failed to transcribe with all models: ${error.message}`);
  }
};
