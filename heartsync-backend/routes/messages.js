const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { getChatHistory, sendMessage } = require("../controllers/messageController");

router.get("/:otherUserId", authMiddleware, getChatHistory);
router.post("/", authMiddleware, sendMessage);

module.exports = router;
