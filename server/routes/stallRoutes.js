
const express = require("express");
const router = express.Router();

const {
  addStall,
  getStalls,
} = require("../controllers/stallController");

router.post("/add", addStall);
router.get("/:eventId", getStalls);

module.exports = router;