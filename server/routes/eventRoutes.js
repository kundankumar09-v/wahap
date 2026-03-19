const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  createEvent,
  getEvents,
  getEventById
} = require("../controllers/eventcontroller");

router.post(
  "/create",
  upload.fields([
    { name: "eventImage", maxCount: 1 },
    { name: "layoutImage", maxCount: 1 }
  ]),
  createEvent
);

router.get("/", getEvents);

router.get("/:id", getEventById);

module.exports = router;