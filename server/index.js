const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const eventRoutes = require("./routes/eventRoutes");
const stallRoutes = require("./routes/stallRoutes");
const visitRoutes = require("./routes/visitRoutes");
const bannerRoutes = require("./routes/bannerRoutes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// DB connect
connectDB();

// routes
app.use("/api/events", eventRoutes);
app.use("/api/stalls", stallRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/banners", bannerRoutes);

app.get("/", (req, res) => {
  res.send("WAHAP API Running");
});
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));