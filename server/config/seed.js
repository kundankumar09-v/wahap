const mongoose = require("mongoose");
const Event = require("../models/event");
const Stall = require("../models/stall");

const seedData = async () => {
  try {
    const eventCount = await Event.countDocuments();
    if (eventCount > 0) {
      console.log("Database already has events. Skipping seed.");
      return;
    }

    console.log("Seeding database with default events and stalls...");

    const defaultEvents = [
      {
        name: "Neon Lights Music Concert",
        type: "concert",
        city: "Hyderabad",
        address: "Gachibowli Stadium",
        duration: "4 hours",
        date: "2026-12-15",
        ticketType: "Paid",
        ageLimit: "18+",
        language: "English/Hindi",
        aboutEvent: "Experience the most electrifying music concert of the year with top artists performing live under neon lights.",
        eventImage: "https://images.unsplash.com/photo-1540039155732-d68a9f394464?w=800&q=80",
        layoutImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80",
        createdBy: "Admin"
      },
      {
        name: "Tech Innovators Exhibition",
        type: "exhibition",
        city: "Bangalore",
        address: "BIEC Grounds",
        duration: "3 Days",
        date: "2026-10-05",
        ticketType: "Free",
        ageLimit: "All Ages",
        language: "English",
        aboutEvent: "Explore the future of technology, AI, and robotics. Meet startup founders and try out cutting-edge gadgets.",
        eventImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        layoutImage: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80",
        createdBy: "Admin"
      },
      {
        name: "Laughter Riot Comedy Show",
        type: "comedy",
        city: "Mumbai",
        address: "NCPA Nariman Point",
        duration: "2 hours",
        date: "2026-11-20",
        ticketType: "Paid",
        ageLimit: "16+",
        language: "Hindi",
        aboutEvent: "A lineup of the country's best comedians ready to make you laugh until your stomach hurts.",
        eventImage: "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800&q=80",
        layoutImage: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&q=80",
        createdBy: "Admin"
      }
    ];

    for (let eventData of defaultEvents) {
      const event = new Event(eventData);
      await event.save();

      // Seed stalls for this event
      const stalls = [
        { name: "Main Entry", type: "entry", x: 12.5, y: 12.5 },
        { name: "Information", type: "help", x: 37.5, y: 12.5 },
        { name: "VIP Lounge", type: "stall", x: 87.5, y: 37.5 },
        { name: "Food Court", type: "food", x: 12.5, y: 87.5 },
        { name: "Restroom A", type: "restroom", x: 87.5, y: 87.5 },
        { name: "Main Stage", type: "stage", x: 62.5, y: 62.5 },
        { name: "Exit Gate", type: "exit", x: 62.5, y: 12.5 },
      ];

      for (let stallData of stalls) {
        stallData.eventId = event._id.toString();
        const stall = new Stall(stallData);
        await stall.save();
      }
    }

    console.log("✅ Seed completed successfully! Default events are now available.");
  } catch (error) {
    console.error("❌ Seeding error:", error);
  }
};

module.exports = seedData;
