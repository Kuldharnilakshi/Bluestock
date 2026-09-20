const pool = require("../config/db");

const getMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        m.id AS match_id,
        u.id,
        u.name,
        u.age,
        u.gender,
        u.bio,
        u.interests,
        u.city,
        u.profile_pic,
        m.created_at
      FROM matches m
      JOIN users u
        ON (
          (m.user1_id = $1 AND u.id = m.user2_id)
          OR
          (m.user2_id = $1 AND u.id = m.user1_id)
        )
      WHERE m.user1_id = $1
         OR m.user2_id = $1
      ORDER BY m.created_at DESC
      `,
      [userId]
    );

    res.json({
      matches: result.rows
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};

module.exports = {
  getMatches
};