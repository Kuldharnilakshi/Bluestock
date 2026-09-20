const pool = require("../config/db");

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, age, gender, bio,
              interests, city, profile_pic
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};


const updateProfile = async (req, res) => {
  try {
    const {
      name,
      age,
      gender,
      bio,
      interests,
      city,
      profilePic
    } = req.body;

    const formattedInterests = Array.isArray(interests)
      ? interests.join(", ")
      : (interests || null);

    const result = await pool.query(
      `UPDATE users
       SET name = $1,
           age = $2,
           gender = $3,
           bio = $4,
           interests = $5,
           city = $6,
           profile_pic = $7
       WHERE id = $8
       RETURNING id, name, email, age, gender,
                 bio, interests, city, profile_pic`,
      [
        name,
        age,
        gender,
        bio,
        formattedInterests,
        city,
        profilePic,
        req.user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "Profile updated successfully",
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};


module.exports = {
  getProfile,
  updateProfile
};