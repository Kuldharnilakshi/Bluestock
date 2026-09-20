const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const { newDb } = require("pg-mem");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const DATA_DIR = path.join(__dirname, "../data");
const STORE_FILE = path.join(DATA_DIR, "heartsync_store.json");

let poolInstance = null;

function createEmbeddedDatabase() {
  console.log("Initializing embedded PostgreSQL database engine (pg-mem)...");
  const db = newDb();

  // Create tables
  db.public.none(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      age INTEGER,
      gender VARCHAR(50),
      bio TEXT,
      interests TEXT,
      city VARCHAR(100),
      profile_pic TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE likes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      liked_user_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, liked_user_id)
    );

    CREATE TABLE matches (
      id SERIAL PRIMARY KEY,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user1_id, user2_id)
    );

    CREATE TABLE messages (
      id SERIAL PRIMARY KEY,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const pg = db.adapters.createPg();
  const rawPool = new pg.Pool();

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Helper to persist snapshot to disk (debounced)
  let saveTimeout = null;
  const scheduleSave = () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      try {
        const users = (await rawPool.query("SELECT * FROM users ORDER BY id ASC")).rows;
        const likes = (await rawPool.query("SELECT * FROM likes ORDER BY id ASC")).rows;
        const matches = (await rawPool.query("SELECT * FROM matches ORDER BY id ASC")).rows;
        const messages = (await rawPool.query("SELECT * FROM messages ORDER BY id ASC")).rows;

        const snapshot = { users, likes, matches, messages, savedAt: new Date().toISOString() };
        fs.writeFileSync(STORE_FILE, JSON.stringify(snapshot, null, 2), "utf-8");
      } catch (e) {
        console.error("Error saving database snapshot:", e);
      }
    }, 400);
  };

  // Seed or restore data
  const seedOrRestore = async () => {
    if (fs.existsSync(STORE_FILE)) {
      try {
        const rawData = fs.readFileSync(STORE_FILE, "utf-8");
        const stored = JSON.parse(rawData);

        if (Array.isArray(stored.users) && stored.users.length > 0) {
          console.log(`Restoring ${stored.users.length} users from storage...`);
          for (const u of stored.users) {
            await rawPool.query(
              `INSERT INTO users (name, email, password, age, gender, bio, interests, city, profile_pic)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [u.name, u.email, u.password, u.age, u.gender, u.bio, u.interests, u.city, u.profile_pic]
            );
          }

          if (Array.isArray(stored.likes)) {
            for (const l of stored.likes) {
              await rawPool.query(
                `INSERT INTO likes (user_id, liked_user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [l.user_id, l.liked_user_id]
              );
            }
          }

          if (Array.isArray(stored.matches)) {
            for (const m of stored.matches) {
              await rawPool.query(
                `INSERT INTO matches (user1_id, user2_id) VALUES ($1, $2) ON CONFLICT (user1_id, user2_id) DO NOTHING`,
                [m.user1_id, m.user2_id]
              );
            }
          }

          if (Array.isArray(stored.messages)) {
            for (const msg of stored.messages) {
              await rawPool.query(
                `INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)`,
                [msg.sender_id, msg.receiver_id, msg.message]
              );
            }
          }

          console.log("Database restored successfully from local store.");
          return;
        }
      } catch (err) {
        console.warn("Failed to load existing store file, falling back to seed:", err.message);
      }
    }

    // Default Seed Data
    console.log("Seeding default demo profiles...");
    const hashedPassword = bcrypt.hashSync("password123", 10);

    const demoUsers = [
      {
        name: "Aarav Sharma",
        email: "aarav@gmail.com",
        age: 25,
        gender: "male",
        city: "Mumbai",
        bio: "Software engineer by day, guitarist by night. Always down for spontaneous road trips and filter coffee.",
        interests: "Music, Travel, Tech, Coffee",
        profile_pic: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=85"
      },
      {
        name: "Sophia Patel",
        email: "sophia@gmail.com",
        age: 24,
        gender: "female",
        city: "Mumbai",
        bio: "Book lover, foodie and someone who believes the best connections start with a good conversation.",
        interests: "Books, Food, Travel, Movies",
        profile_pic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85"
      },
      {
        name: "Kabir Mehta",
        email: "kabir@gmail.com",
        age: 26,
        gender: "male",
        city: "Bangalore",
        bio: "Tech enthusiast with a soft spot for sunsets, good food and deep conversations.",
        interests: "Technology, Fitness, Food, Nature",
        profile_pic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=85"
      },
      {
        name: "Ishita Roy",
        email: "ishita@gmail.com",
        age: 23,
        gender: "female",
        city: "Pune",
        bio: "Creative soul who enjoys photography, indie music and spontaneous weekend roadtrips.",
        interests: "Photography, Music, Art, Adventure",
        profile_pic: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=85"
      },
      {
        name: "Nilakshi Sen",
        email: "nilakshi@gmail.com",
        age: 24,
        gender: "female",
        city: "Pune",
        bio: "Designer who loves slow mornings, meaningful conversations and discovering beautiful places.",
        interests: "Design, Travel, Coffee, Art",
        profile_pic: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85"
      },
      {
        name: "Rohan Verma",
        email: "rohan@gmail.com",
        age: 27,
        gender: "male",
        city: "Delhi",
        bio: "Architect with a passion for urban cycling, espresso, and modern art.",
        interests: "Design, Cycling, Coffee, Architecture",
        profile_pic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=85"
      },
      {
        name: "Ananya Iyer",
        email: "ananya@gmail.com",
        age: 24,
        gender: "female",
        city: "Bangalore",
        bio: "Product manager & dog mom. Love hiking, pottery classes and board game nights!",
        interests: "Hiking, Dogs, Board Games, Pottery",
        profile_pic: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=85"
      }
    ];

    for (const u of demoUsers) {
      await rawPool.query(
        `INSERT INTO users (name, email, password, age, gender, bio, interests, city, profile_pic)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [u.name, u.email, hashedPassword, u.age, u.gender, u.bio, u.interests, u.city, u.profile_pic]
      );
    }

    // Create demo match between Aarav (1) and Sophia (2)
    await rawPool.query("INSERT INTO likes (user_id, liked_user_id) VALUES (1, 2)");
    await rawPool.query("INSERT INTO likes (user_id, liked_user_id) VALUES (2, 1)");
    await rawPool.query("INSERT INTO matches (user1_id, user2_id) VALUES (1, 2)");

    // Sample welcome chat
    await rawPool.query(
      `INSERT INTO messages (sender_id, receiver_id, message)
       VALUES (2, 1, 'Hey Aarav! Loved your guitar bio! What kind of music do you play? 🎸')`
    );
    await rawPool.query(
      `INSERT INTO messages (sender_id, receiver_id, message)
       VALUES (1, 2, 'Hey Sophia! Mostly indie rock and acoustic fingerstyle. Nice to connect with you! 😊')`
    );

    scheduleSave();
    console.log("Database seeded successfully with demo users and sample match!");
  };

  seedOrRestore().catch((err) => {
    console.error("Error during seed/restore:", err);
  });

  // Wrap query to auto-trigger scheduleSave on mutating statements
  const originalQuery = rawPool.query.bind(rawPool);
  rawPool.query = async function (sqlTextOrConfig, values, callback) {
    const result = await originalQuery(sqlTextOrConfig, values, callback);

    const sql = typeof sqlTextOrConfig === "string" ? sqlTextOrConfig.toUpperCase() : "";
    if (sql.includes("INSERT") || sql.includes("UPDATE") || sql.includes("DELETE")) {
      scheduleSave();
    }

    return result;
  };

  return rawPool;
}

// Export singleton pool
if (!poolInstance) {
  poolInstance = createEmbeddedDatabase();
}

module.exports = poolInstance;