const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth");

const {
  getDiscoverUsers
} = require("../controllers/discoverController");

router.get("/", authMiddleware, getDiscoverUsers);

module.exports = router;