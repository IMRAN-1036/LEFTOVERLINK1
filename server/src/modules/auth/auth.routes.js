const express = require("express");
const { authenticate } = require("../../middleware/auth");
const { register, login, refresh, me, logout } = require("./auth.controller");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.get("/me", authenticate, me);
router.post("/logout", authenticate, logout);

module.exports = router;

