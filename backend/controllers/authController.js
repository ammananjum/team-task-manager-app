const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await pool.query(
      `INSERT INTO users (name, email, password, image)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, image`,
      [name, email, hashedPassword, null]
    );

    res.json({
      message: "User registered successfully",
      user: user.rows[0],
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
};


// LOGIN (FIXED - ALWAYS GET FROM DB)
exports.login = async (req, res) => {
  try {
    const user = req.user;

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // IMPORTANT: ensure image always exists
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image || null,
    };

    res.json({
      message: "Login successful",
      token,
      user: safeUser,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// UPDATE PROFILE (FIXED)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const image = req.file
      ? `/uploads/${req.file.filename}`
      : null;

    const result = await pool.query(
      `UPDATE users 
       SET name = $1,
           image = COALESCE($2, image)
       WHERE id = $3
       RETURNING id, name, email, image`,
      [name, image, userId]
    );

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0],
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};