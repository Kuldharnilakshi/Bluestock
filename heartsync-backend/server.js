const express = require("express");
const cors = require("cors");
const http = require("http");
const path = require("path");
const fs = require("fs");
const { Server } = require("socket.io");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const discoverRoutes = require("./routes/discover");
const likeRoutes = require("./routes/likes");
const matchRoutes = require("./routes/matches");
const messageRoutes = require("./routes/messages");

const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// REST APIs
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api/likes", likeRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "HeartSync",
    timestamp: new Date().toISOString()
  });
});

// Serve frontend build if dist exists
const clientDistPath = path.join(__dirname, "../client/dist");
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: "API route not found" });
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({
      message: "HeartSync Backend Running ❤️"
    });
  });
}

// HTTP SERVER
const server = http.createServer(app);

// SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (userId) => {
    const id = parseInt(userId, 10);
    if (id) {
      socket.join(`user_${id}`);
      console.log(`User ${id} joined their room`);
    }
  });

  socket.on("send_message", async (data) => {
    try {
      const senderId = parseInt(data.senderId, 10);
      const receiverId = parseInt(data.receiverId, 10);
      const message = (data.message || "").trim();

      if (!senderId || !receiverId || !message) return;

      // Save message
      const result = await pool.query(
        `INSERT INTO messages
         (sender_id, receiver_id, message)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [senderId, receiverId, message]
      );

      const savedMessage = result.rows[0];

      // Send to receiver
      io.to(`user_${receiverId}`).emit("receive_message", savedMessage);

      // Send back to sender
      io.to(`user_${senderId}`).emit("message_sent", savedMessage);

    } catch (error) {
      console.error("Message error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`HeartSync server running on port ${PORT}`);
});