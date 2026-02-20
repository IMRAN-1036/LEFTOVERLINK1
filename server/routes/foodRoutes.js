const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createFood,
  getFoods,
  claimFood,
  deleteFood,
  incrementView,
} = require("../controllers/foodController");

// Public: allow unauthenticated read for easier testing
router.get("/", getFoods);

// Protected endpoints
router.post("/", auth, createFood);
router.put("/claim/:id", auth, claimFood);
router.put("/view/:id", auth, incrementView);
router.delete("/:id", auth, deleteFood);

module.exports = router;
