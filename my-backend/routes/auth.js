const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Initialize router
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
    try {
        console.log("Received POST request to /register");

        // Extracting request body
        const { username, email, password } = req.body;
        console.log("Request Body:", req.body);

        // Validate request body
        if (!username || !email || !password) {
            console.error("Validation Error: Missing required fields");
            return res.status(400).json({ error: "All fields are required" });
        }
        console.log("Validation Passed");

        // Hashing the password
        const salt = await bcrypt.genSalt(10);
        console.log("Generated Salt for Password Hashing:", salt);

        const hashedPassword = await bcrypt.hash(password, salt);
        console.log("Hashed Password:", hashedPassword);

        // Creating new user object
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });
        console.log("New User Object Created:", newUser);

        // Saving user to the database
        const savedUser = await newUser.save();
        console.log("User Saved Successfully in Database:", savedUser);

        // Sending response
        res.status(201).json({ message: "User registered successfully", user: savedUser });
    } catch (err) {
        // Logging errors
        console.error("Error during registration process:", err);

        // Handling duplicate key error (e.g., email or username already exists)
        if (err.code === 11000) {
            console.error("Duplicate Key Error:", err.keyValue);
            return res.status(400).json({ error: "Email or username already exists" });
        }

        // Sending generic error response
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
