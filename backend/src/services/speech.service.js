const axios = require("axios");
const FormData = require("form-data");
const { AssemblyAI } = require("assemblyai");

// 🚀 1. ตั้งค่า AssemblyAI Client
const assemblyaiClient = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY,
});

// 1. AssemblyAI (แทนที่ Google)
exports.transcribeWithAssemblyAI = async (buffer) => {
  try {
    console.log("🔄 Transcribing with AssemblyAI...");

    if (!process.env.ASSEMBLYAI_API_KEY) {
      console.warn("⚠️ AssemblyAI API key not configured, skipping...");
      return "[AssemblyAI API key not configured]";
    }

    // 🚀 อัปเดตล่าสุด: ใช้ speech_models (เติม s และเป็น Array)
    const transcript = await assemblyaiClient.transcripts.transcribe({
      audio: buffer,
      language_code: "en", // 🇹🇭 เปลี่ยนเป็น "th" ได้ถ้าเสียงเป็นภาษาไทย
      speech_models: ["universal-3-pro"],
    });

    if (transcript.status === "error") {
      throw new Error(transcript.error);
    }

    console.log("✓ AssemblyAI transcription complete");
    return transcript.text || "[No speech detected]";
  } catch (error) {
    console.error("❌ AssemblyAI transcription failed:", error.message);
    return `[AssemblyAI Error: ${error.message}]`;
  }
};

// 2. OpenAI Whisper API (via Axios)
exports.transcribeWithWhisperAPI = async (buffer) => {
  try {
    console.log("🔄 Transcribing with OpenAI API...");

    const form = new FormData();
    form.append("file", buffer, {
      filename: "audio.mp4",
      contentType: "audio/mp4",
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
          "Content-Type": "audio/mp4",
        },
        params: {
          model: "nova-2",
          language: "en", // 🇹🇭 เปลี่ยนเป็น "th" ได้ถ้าเสียงเป็นภาษาไทย
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

  const [assemblyResult, whisperResult, deepgramResult] =
    await Promise.allSettled([
      exports.transcribeWithAssemblyAI(buffer),
      exports.transcribeWithWhisperAPI(buffer),
      exports.transcribeWithDeepgram(buffer),
    ]);

  return {
    // 🚀 เปลี่ยน key เป็น 'assembly' ให้ตรงกับในไฟล์ audio.controller.js
    assembly:
      assemblyResult.status === "fulfilled"
        ? assemblyResult.value || "[No output from AssemblyAI]"
        : `[AssemblyAI Error]`,

    whisper:
      whisperResult.status === "fulfilled"
        ? whisperResult.value || "[No output from Whisper]"
        : `[Whisper Error]`,

    deepgram:
      deepgramResult.status === "fulfilled"
        ? deepgramResult.value || "[No output from Deepgram]"
        : `[Deepgram Error]`,

    timestamp: new Date().toISOString(),
  };
};
