const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth");

const {
  getProfile,
  updateProfile
} = require("../controllers/profileController");

router.get("/", authMiddleware, getProfile);

router.put("/", authMiddleware, updateProfile);

module.exports = router;