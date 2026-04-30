const fs = require("fs");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.transcribe = async (filePath) => {
  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "gpt-4o-transcribe",
  });

  fs.unlinkSync(filePath); // ลบไฟล์หลังใช้

  return response.text;
};
