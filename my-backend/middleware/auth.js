const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization"); // Retrieve token from headers
    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        req.user = verified; // Attach verified user info to request object
        next(); // Proceed to the next middleware or route
    } catch (err) {
        res.status(400).json({ error: "Invalid token" });
    }
};

module.exports = authenticateToken;
