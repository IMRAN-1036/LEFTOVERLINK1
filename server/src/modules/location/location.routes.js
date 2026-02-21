const express = require("express");
const { searchLocation } = require("./location.controller");

const router = express.Router();

router.get("/search", searchLocation);

module.exports = router;
