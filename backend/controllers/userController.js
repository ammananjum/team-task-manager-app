const pool = require("../config/db");

// UPDATE PROFILE (NAME + IMAGE FILE)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    let avatarPath = null;

    if (req.file) {
      avatarPath = `/uploads/avatars/${req.file.filename}`;
    }

    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           avatar = COALESCE($2, avatar)
       WHERE id = $3
       RETURNING id, name, email, avatar`,
      [name, avatarPath, userId]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};