// controllers/projectController.js
const pool = require("../config/db");

exports.getProjects = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch projects" });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Project name required" });

    const result = await pool.query(
      `INSERT INTO projects (name, description, user_id) VALUES ($1,$2,$3) RETURNING *`,
      [name, description, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Failed to create project" });
  }
};

// ── NEW: Edit project name + description
exports.updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      `UPDATE projects SET name=$1, description=$2
       WHERE id=$3 AND user_id=$4 RETURNING *`,
      [name, description, req.params.id, req.user.id]
    );
    if (!result.rows.length)
      return res.status(404).json({ message: "Project not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM projects WHERE id=$1 AND user_id=$2`,
      [req.params.id, req.user.id]
    );
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};