const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const eventRoutes = require("./routes/eventRoutes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// DB connect
connectDB();

// routes
app.use("/api/events", eventRoutes);

app.get("/", (req, res) => {
  res.send("WAHAP API Running");
});
const stallRoutes = require("./routes/stallRoutes");
const visitRoutes = require("./routes/visitRoutes");
app.use("/api/stalls", stallRoutes);
app.use("/api/visits", visitRoutes);
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));