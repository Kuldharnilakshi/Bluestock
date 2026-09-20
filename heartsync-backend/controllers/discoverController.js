const pool = require("../config/db");

const getDiscoverUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    const result = await pool.query(
      `SELECT id, name, age, gender, bio,
              interests, city, profile_pic
       FROM users
       WHERE id != $1
         AND id NOT IN (SELECT liked_user_id FROM likes WHERE user_id = $1)
       ORDER BY created_at DESC`,
      [currentUserId]
    );

    res.json({
      users: result.rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

module.exports = {
  getDiscoverUsers
};