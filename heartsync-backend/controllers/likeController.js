const pool = require("../config/db");

const likeUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { likedUserId } = req.body;

    if (!likedUserId) {
      return res.status(400).json({
        message: "likedUserId is required"
      });
    }

    if (userId === likedUserId) {
      return res.status(400).json({
        message: "You cannot like yourself"
      });
    }

    // Check if already liked
    const existingLike = await pool.query(
      `SELECT * FROM likes
       WHERE user_id = $1
       AND liked_user_id = $2`,
      [userId, likedUserId]
    );

    if (existingLike.rows.length > 0) {
      return res.status(400).json({
        message: "User already liked"
      });
    }

    // Save like
    await pool.query(
      `INSERT INTO likes(user_id, liked_user_id)
       VALUES($1, $2)
       ON CONFLICT (user_id, liked_user_id) DO NOTHING`,
      [userId, likedUserId]
    );

    // Also add mutual like so both show in each other's lists
    await pool.query(
      `INSERT INTO likes(user_id, liked_user_id)
       VALUES($1, $2)
       ON CONFLICT (user_id, liked_user_id) DO NOTHING`,
      [likedUserId, userId]
    );

    // Automatically create match and add to chats
    const user1 = Math.min(userId, likedUserId);
    const user2 = Math.max(userId, likedUserId);

    await pool.query(
      `INSERT INTO matches(user1_id, user2_id)
       VALUES($1, $2)
       ON CONFLICT (user1_id, user2_id) DO NOTHING`,
      [user1, user2]
    );

    // Add a cute initial starter message from the matched person if none exists
    const existingMsgs = await pool.query(
      `SELECT * FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2)
          OR (sender_id = $2 AND receiver_id = $1)
       LIMIT 1`,
      [userId, likedUserId]
    );

    if (existingMsgs.rows.length === 0) {
      const likedPerson = (await pool.query("SELECT name FROM users WHERE id = $1", [likedUserId])).rows[0];
      const starterMsg = likedPerson
        ? `Hey! ✨ So happy we matched! Loved your profile, what's your favorite way to spend a weekend? 💖`
        : `Hey! It's a match! ✨ How are you doing today?`;

      await pool.query(
        `INSERT INTO messages(sender_id, receiver_id, message)
         VALUES($1, $2, $3)`,
        [likedUserId, userId, starterMsg]
      );
    }

    return res.json({
      message: "It's a Match! ❤️",
      matched: true,
      matchedUserId: likedUserId
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

module.exports = {
  likeUser
};