const pool = require("../config/db");

// Get messages between current user and another user
const getChatHistory = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = parseInt(req.params.otherUserId, 10);

    if (!otherUserId) {
      return res.status(400).json({ message: "Invalid other user ID" });
    }

    const messages = await pool.query(
      `SELECT id, sender_id, receiver_id, message, created_at
       FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [currentUserId, otherUserId]
    );

    // Get other user's basic info for convenience
    const otherUserResult = await pool.query(
      `SELECT id, name, age, city, profile_pic FROM users WHERE id = $1`,
      [otherUserId]
    );

    res.json({
      otherUser: otherUserResult.rows[0] || null,
      messages: messages.rows
    });
  } catch (error) {
    console.error("getChatHistory error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Send message via REST endpoint (fallback / alternative to socket)
const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, message } = req.body;

    if (!receiverId || !message || !message.trim()) {
      return res.status(400).json({ message: "Receiver and message are required" });
    }

    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [senderId, receiverId, message.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  getChatHistory,
  sendMessage
};
