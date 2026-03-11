const router = require("express").Router();
const { body } = require("express-validator");
const { signup, login, getMe } = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: User authentication endpoints
 */

/**
 * @openapi
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: Account created successfully with JWT token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    "/signup",
    [
        body("name")
            .trim()
            .notEmpty().withMessage("Name is required")
            .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters"),
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Invalid email address")
            .normalizeEmail(),
        body("password")
            .notEmpty().withMessage("Password is required")
            .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ],
    signup
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login and receive a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
    "/login",
    [
        body("email")
            .trim()
            .notEmpty().withMessage("Email is required")
            .isEmail().withMessage("Invalid email address")
            .normalizeEmail(),
        body("password")
            .notEmpty().withMessage("Password is required"),
    ],
    login
);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile returned
 *       401:
 *         description: Unauthorized – invalid or missing token
 */
router.get("/me", authMiddleware, getMe);

module.exports = router;
