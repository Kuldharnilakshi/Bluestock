const pool = require("./config/db");
const bcrypt = require("bcrypt");

async function seed() {
  try {
    // 1. Update user 1 (Nilakshi) if empty
    await pool.query(
      `UPDATE users
       SET age = COALESCE(age, 24),
           gender = COALESCE(gender, 'female'),
           city = COALESCE(city, 'Pune'),
           bio = COALESCE(bio, 'Designer who loves slow mornings, meaningful conversations and discovering beautiful places.'),
           interests = COALESCE(interests, 'Design, Travel, Coffee, Music'),
           profile_pic = COALESCE(profile_pic, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85')
       WHERE id = 1`
    );

    // 2. Sample additional users if they do not exist
    const defaultPassword = await bcrypt.hash("password123", 10);

    const candidates = [
      {
        name: "Sophia",
        email: "sophia@gmail.com",
        age: 25,
        gender: "female",
        city: "Mumbai",
        bio: "Book lover, foodie and someone who believes the best connections start with a good conversation.",
        interests: "Books, Food, Travel, Movies",
        profile_pic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85"
      },
      {
        name: "Kabir",
        email: "kabir@gmail.com",
        age: 26,
        gender: "male",
        city: "Bangalore",
        bio: "Tech enthusiast with a soft spot for sunsets, good food and deep conversations.",
        interests: "Technology, Fitness, Food, Nature",
        profile_pic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=85"
      },
      {
        name: "Ishita",
        email: "ishita@gmail.com",
        age: 23,
        gender: "female",
        city: "Nashik",
        bio: "Creative soul who enjoys photography, indie music and spontaneous weekend roadtrips.",
        interests: "Photography, Music, Art, Adventure",
        profile_pic: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=85"
      }
    ];

    for (const c of candidates) {
      const exists = await pool.query("SELECT id FROM users WHERE email = $1", [c.email]);
      if (exists.rows.length === 0) {
        await pool.query(
          `INSERT INTO users (name, email, password, age, gender, city, bio, interests, profile_pic)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [c.name, c.email, defaultPassword, c.age, c.gender, c.city, c.bio, c.interests, c.profile_pic]
        );
        console.log(`Created sample user: ${c.name}`);
      }
    }

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await pool.end();
  }
}

seed();
