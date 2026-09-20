const pool = require("./config/db");
const bcrypt = require("bcrypt");

async function setDemoPasswords() {
  try {
    const defaultPassword = await bcrypt.hash("password123", 10);
    const res = await pool.query(
      "UPDATE users SET password = $1",
      [defaultPassword]
    );
    console.log(`Updated passwords for ${res.rowCount} users to password123`);
  } catch (err) {
    console.error("Error setting demo passwords:", err);
  } finally {
    await pool.end();
  }
}

setDemoPasswords();
