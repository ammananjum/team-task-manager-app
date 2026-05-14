// controllers/notificationController.js
const pool = require("../config/db");

// GET all notifications for the logged-in user
// Joins team_invites so we get invite_id + invite_status in one query
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT
         n.id,
         n.type,
         n.message,
         n.is_read,
         n.created_at,
         n.invite_id,
         n.team_id,
         n.sender_id,
         n.direction,
         ti.status          AS invite_status,
         ti.recipient_id    AS invite_recipient_id,
         t.name             AS team_name,
         sender.name        AS sender_name,
         recipient.name     AS recipient_name,
         recipient.email    AS recipient_email
       FROM notifications n
       LEFT JOIN team_invites ti  ON ti.id       = n.invite_id
       LEFT JOIN teams        t   ON t.id        = n.team_id
       LEFT JOIN users        sender    ON sender.id    = n.sender_id
       LEFT JOIN users        recipient ON recipient.id = ti.recipient_id
       WHERE n.user_id = $1
       ORDER BY n.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// MARK ALL as read
exports.markAllRead = async (req, res) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1`,
      [req.user.id]
    );
    res.json({ message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};