exports.login = async (req, res, next) => {
  try {
    const { name, age, consent } = req.body;

    if (!name || !age || !consent) {
      return res.status(400).json({
        message: "Name, age, and consent are required",
      });
    }

    // Return user data and success message
    res.json({
      success: true,
      message: "Login successful",
      user: {
        name,
        age,
        consent,
      },
    });
  } catch (err) {
    next(err);
  }
};
