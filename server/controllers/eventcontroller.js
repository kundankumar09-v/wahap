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
      eventImage: req.files?.eventImage?.[0]?.path || "uploads/placeholder_event.jpg",
      bannerImage: req.files?.bannerImage?.[0]?.path || "uploads/placeholder_banner.jpg",
      layoutImage: req.files?.layoutImage?.[0]?.path || "uploads/placeholder_layout.jpg",
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
    let { city, type, query } = req.query;

    const filter = {};

    if (city && city !== "All" && city !== "All Cities") {
        filter.city = city.trim();
    }
    
    if (type) filter.type = type.toLowerCase().trim();
    
    if (query) {
      const searchTerm = query.trim();
      filter.$or = [
        { name: { $regex: searchTerm, $options: "i" } },
        { type: { $regex: searchTerm, $options: "i" } },
        { aboutEvent: { $regex: searchTerm, $options: "i" } },
        { address: { $regex: searchTerm, $options: "i" } }
      ];
    }

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


// DELETE EVENT
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("DELETE EVENT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};


// UPDATE EVENT
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("UPDATE EVENT ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};