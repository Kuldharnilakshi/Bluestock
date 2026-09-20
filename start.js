const { spawn } = require("child_process");

console.log("==========================================");
console.log("   🚀 Launching HeartSync Dating App   ");
console.log("==========================================\n");

// 1. Launch Backend (Express + Socket.io + Database on Port 5000)
const server = spawn("node", ["heartsync-backend/server.js"], {
  stdio: "inherit",
  shell: true,
  cwd: __dirname
});

// 2. Launch Client (Vite Dev Server on Port 5173)
const client = spawn("npm", ["run", "dev", "--prefix", "client"], {
  stdio: "inherit",
  shell: true,
  cwd: __dirname
});

function cleanup() {
  console.log("\nShutting down HeartSync services...");
  try { server.kill(); } catch (e) {}
  try { client.kill(); } catch (e) {}
  process.exit(0);
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
