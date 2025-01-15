const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Initialize router
const router = express.Router();

const jwt = require("jsonwebtoken"); // Import JWT

const authenticateToken = require("../middleware/auth");

router.get("/protected", authenticateToken, (req, res) => {
    res.status(200).json({ message: "You have accessed a protected route", user: req.user });
});


// Login route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body; // Extract email and password
        console.log("Login Request Body:", req.body);

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, email: user.email }, // Payload
            process.env.JWT_SECRET,             // Secret key
            { expiresIn: "1h" }                 // Token expiry
        );

        // Respond with token and user info
        res.status(200).json({ message: "Login successful", token, user });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

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
