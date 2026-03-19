const Event = require("../models/event");


// CREATE EVENT
exports.createEvent = async (req, res) => {
  try {
    const {
      name,
      type,
      city,
      address,
      duration,
      date,
      endDate,
      ticketType,
      ageLimit,
      language,
      aboutEvent,
    } = req.body;

    const normalizedType = type?.toLowerCase().trim();
    const normalizedCity = city?.trim();

    const newEvent = new Event({
      name,
      type: normalizedType,
      city: normalizedCity,
      address,
      duration,
      date,
      endDate,
      ticketType,
      ageLimit,
      language,
      aboutEvent,
      eventImage: req.files?.eventImage?.[0]?.path,
      layoutImage: req.files?.layoutImage?.[0]?.path,
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: newEvent,
    });

  } catch (error) {
    console.error("CREATE EVENT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


// GET ALL EVENTS
exports.getEvents = async (req, res) => {
  try {
    let { city, type } = req.query;

    const filter = {};

    if (city) filter.city = city.trim();
    if (type) filter.type = type.toLowerCase().trim();

    const events = await Event.find(filter).sort({ createdAt: -1 });

    res.json(events);

  } catch (error) {
    console.error("GET EVENTS ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


// GET SINGLE EVENT (needed for EventDetails page)
exports.getEventById = async (req, res) => {
  try {

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);

  } catch (error) {
    console.error("GET EVENT BY ID ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};