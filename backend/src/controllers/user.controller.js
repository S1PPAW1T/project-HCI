const Audio = require("../models/audio.model");

exports.login = async (req, res, next) => {
  try {
    console.log("Login request received:", req.body);

    const { name, age, consent } = req.body;

    if (!name || !age || !consent) {
      console.log(
        "Missing fields - name:",
        name,
        "age:",
        age,
        "consent:",
        consent,
      );
      return res.status(400).json({
        message: "Name, age, and consent are required",
      });
    }

    // Create a new Audio record with name and age
    const audio = await Audio.create({
      name,
      age,
    });

    console.log("Audio record created:", audio._id);

    // Return the record with ID
    res.status(201).json({
      success: true,
      message: "Login successful",
      data: {
        id: audio._id,
        name: audio.name,
        age: audio.age,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    next(err);
  }
};
