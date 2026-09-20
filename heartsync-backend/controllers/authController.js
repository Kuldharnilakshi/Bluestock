const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const defaultAvatars = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=85",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=85"
    ];
    const defaultAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const newUser = await pool.query(
      `INSERT INTO users(name, email, password, age, city, bio, interests, profile_pic)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, age, city, bio, interests, profile_pic`,
      [
        name,
        email,
        hashedPassword,
        24,
        "Mumbai",
        "Looking for genuine connections, shared laughs & good vibes ✨",
        "Coffee, Music, Travel, Art",
        defaultAvatar
      ]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user: newUser.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};


// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const user = result.rows[0];

    // Check password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
};


module.exports = {
  register,
  login
};