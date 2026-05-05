const Professor = require("../models/professor.model");
const Audio = require("../models/audio.model");
const jwt = require('jsonwebtoken');

exports.login = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }
    let professor = await Professor.findOne({ password });
    if (!professor) {
      // สร้างใหม่
      professor = await Professor.create({ password });
    }
    const token = jwt.sign({ id: professor._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: professor._id,
        progress: professor.progress,
        token,
      },
    });
  } catch (err) {
    console.error("Professor login error:", err);
    next(err);
  }
};

exports.verify = (req, res) => {
  res.status(200).json({ success: true });
};

exports.getParticipants = async (req, res, next) => {
  try {
    const professorId = req.professorId;
    // ดึง participants ที่มี audioUrl
    const participants = await Audio.find({ audioUrl: { $exists: true, $ne: null } }).select('name age audioUrl professorRatings');
    // ส่งกลับ list และสำหรับแต่ละคน clarity ที่ professor นี้ให้
    const data = participants.map(p => {
      const rating = (p.professorRatings || []).find(r => r.professorId.toString() === professorId.toString());
      return {
        id: p._id,
        name: p.name,
        age: p.age,
        audioUrl: p.audioUrl,
        clarity: rating ? rating.clarity : null,
      };
    });
    const progress = data.filter(p => p.clarity !== null).length;
    res.status(200).json({
      success: true,
      data,
      progress,
    });
  } catch (err) {
    next(err);
  }
};

exports.submitRating = async (req, res, next) => {
  try {
    const { participantId, clarity } = req.body;
    const professorId = req.professorId;
    if (!['clear', 'unclear'].includes(clarity)) {
      return res.status(400).json({ message: 'Invalid clarity value' });
    }
    // ตรวจสอบว่าประเมินแล้วหรือไม่ ถ้าประเมินแล้ว update ถ้ายัง add
    const audio = await Audio.findById(participantId);
    if (!audio) {
      return res.status(404).json({ message: 'Participant not found' });
    }
    if (!audio.professorRatings) {
      audio.professorRatings = [];
    }
    const existingRatingIndex = audio.professorRatings.findIndex(r => r.professorId.toString() === professorId.toString());
    if (existingRatingIndex >= 0) {
      // update
      audio.professorRatings[existingRatingIndex].clarity = clarity;
      audio.professorRatings[existingRatingIndex].timestamp = new Date();
    } else {
      // add new
      audio.professorRatings.push({
        professorId,
        clarity,
        timestamp: new Date(),
      });
      // อัปเดต progress ถ้าเป็นการประเมินใหม่
      await Professor.findByIdAndUpdate(professorId, { $inc: { progress: 1 } });
    }
    await audio.save();
    res.status(200).json({
      success: true,
      message: "Rating submitted",
    });
  } catch (err) {
    next(err);
  }
};