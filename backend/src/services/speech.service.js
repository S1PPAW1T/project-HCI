const speech = require("@google-cloud/speech");
const axios = require("axios");
const FormData = require("form-data");

// ตั้งค่า Google Cloud Client
const googleClient = new speech.SpeechClient({
  keyFilename:
    process.env.GOOGLE_APPLICATION_CREDENTIALS || "./serviceAccountKey.json",
});

// 1. Google Cloud Speech-to-Text
exports.transcribeWithGoogle = async (buffer) => {
  try {
    console.log("🔄 Transcribing with Google Cloud...");

    const audio = { content: buffer.toString("base64") };
    const config = {
      encoding: "LINEAR16",
      sampleRateHertz: 16000,
      languageCode: "en-US",
      model: "latest_long",
      useEnhanced: true,
    };

    const [response] = await googleClient.recognize({ audio, config });
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

// 2. OpenAI Whisper API (via Axios)
exports.transcribeWithWhisperAPI = async (buffer) => {
  try {
    console.log("🔄 Transcribing with OpenAI API...");

    const form = new FormData();
    form.append("file", buffer, {
      filename: "audio.wav",
      contentType: "audio/wav",
    });
    form.append("model", "whisper-1");

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      },
    );

    console.log("✓ OpenAI transcription complete");
    return response.data.text?.trim() || "[No speech detected]";
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || error.message;
    console.error("❌ OpenAI failed:", errorMessage);
    return `[OpenAI Error: ${errorMessage}]`;
  }
};

// 3. Deepgram Speech-to-Text (via REST API)
exports.transcribeWithDeepgram = async (buffer) => {
  try {
    console.log("🔄 Transcribing with Deepgram...");

    if (!process.env.DEEPGRAM_API_KEY) {
      console.warn("⚠️ Deepgram API key not configured, skipping...");
      return "[Deepgram API key not configured]";
    }

    const response = await axios.post(
      "https://api.deepgram.com/v1/listen",
      buffer,
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          "Content-Type": "audio/wav",
        },
        params: {
          model: "nova-2",
          language: "en",
          punctuate: true,
        },
      },
    );

    const transcript =
      response.data?.results?.channels[0]?.alternatives[0]?.transcript;

    console.log("✓ Deepgram transcription complete");
    return transcript || "[No speech detected]";
  } catch (error) {
    console.error("❌ Deepgram transcription failed:", error.message);
    return `[Deepgram Error: ${error.response?.data?.error || error.message}]`;
  }
};

// 🚀 Transcribe with all 3 models in parallel
exports.transcribeWithAllModels = async (buffer) => {
  console.log("🚀 Starting parallel transcription with all 3 models...");

  // ไม่จำเป็นต้องส่ง fileName แล้ว เพราะทั้ง 3 โมเดลใช้ Buffer ส่งตรงได้เลย
  const [googleResult, whisperResult, deepgramResult] =
    await Promise.allSettled([
      exports.transcribeWithGoogle(buffer),
      exports.transcribeWithWhisperAPI(buffer),
      exports.transcribeWithDeepgram(buffer),
    ]);

  return {
    google:
      googleResult.status === "fulfilled"
        ? googleResult.value
        : `[Google Error]`,
    whisper:
      whisperResult.status === "fulfilled"
        ? whisperResult.value
        : `[Whisper Error]`,
    deepgram:
      deepgramResult.status === "fulfilled"
        ? deepgramResult.value
        : `[Deepgram Error]`,
    timestamp: new Date().toISOString(),
  };
};
