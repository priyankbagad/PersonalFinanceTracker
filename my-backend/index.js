const express = require('express');
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth"); // Import routes

const app = express(); // Initialize Express app

// Middleware
app.use(express.json()); // Parse incoming JSON requests

// Logging Middleware
app.use((req, res, next) => {
    const cleanUrl = decodeURIComponent(req.url);
    console.log(`Received ${req.method} request to ${cleanUrl}`);
    console.log("Request body:", req.body);
    next(); // Proceed to the next middleware or route handler
});

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/auth", authRoutes);

// Catch-All Route for Unmatched Requests
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Start the Server
const PORT = process.env.PORT || 5000; // Fallback to port 5000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
