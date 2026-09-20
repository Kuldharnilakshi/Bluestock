const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth");

const {
  likeUser
} = require("../controllers/likeController");

router.post("/", authMiddleware, likeUser);

module.exports = router;