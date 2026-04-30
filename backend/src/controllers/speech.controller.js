const speechService = require("../services/speech.service");

exports.speechToText = async (req, res, next) => {
  try {
    const filePath = req.file.path;

    const text = await speechService.transcribe(filePath);

    res.json({ text });
  } catch (err) {
    next(err);
  }
};
