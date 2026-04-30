const OpenAI = require("openai");
const { Readable } = require("stream");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.transcribeBuffer = async (buffer) => {
  const stream = Readable.from(buffer);

  const response = await openai.audio.transcriptions.create({
    file: stream,
    model: "gpt-4o-transcribe",
  });

  return response.text;
};
