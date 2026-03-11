const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User");

/**
 * POST /api/auth/signup
 * Register a new user
 */
const signup = async (req, res) => {
    try {
        // Validate inputs
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { name, email, password } = req.body;

        // Check if user already exists in MongoDB
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists. Please log in.",
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);

        // Store user in MongoDB
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase(),
            passwordHash,
        });
        await user.save();

        // Generate JWT (use user._id from Mongo)
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(201).json({
            success: true,
            message: "Account created successfully",
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during signup.",
        });
    }
};

/**
 * POST /api/auth/login
 * Authenticate existing user and return JWT
 */
const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { email, password } = req.body;

        // Find user in MongoDB
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password.",
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error during login.",
        });
    }
};

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }
        return res.status(200).json({
            success: true,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (error) {
        console.error("GetMe error:", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

module.exports = { signup, login, getMe };
