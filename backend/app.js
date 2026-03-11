require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Routes
const authRoutes = require("./routes/authRoutes");
const analyzeRoutes = require("./routes/analyzeRoutes");

const app = express();
app.set("trust proxy", 1);

// ─────────────────────────────────────────────
// Security Headers
// ─────────────────────────────────────────────
app.use(
    helmet({
        crossOriginEmbedderPolicy: false, // Allow Swagger UI to load assets
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
    })
);

// ─────────────────────────────────────────────
// CORS — Restrict to frontend domain
// ─────────────────────────────────────────────
const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5173",
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin, matched origins, or ANY .vercel.app domain
            if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
                callback(null, true);
            } else {
                callback(new Error(`CORS policy violation: origin ${origin} is not allowed`));
            }
        },
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

// ─────────────────────────────────────────────
// Global Rate Limiting
// ─────────────────────────────────────────────
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests. Please wait 15 minutes and try again." },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Stricter limit for auth endpoints
    message: { success: false, message: "Too many authentication attempts. Please wait 15 minutes." },
});

app.use(globalLimiter);

// ─────────────────────────────────────────────
// Body Parsers
// ─────────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        status: "healthy",
        service: "Sales Insight Automator API",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || "development",
    });
});

// ─────────────────────────────────────────────
// Swagger API Documentation
// ─────────────────────────────────────────────
app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        customCss: `
      .swagger-ui .topbar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
      .swagger-ui .topbar-wrapper .link { display: flex; align-items: center; }
      .swagger-ui .info .title { color: #4c3d8f; }
      body { font-family: 'Segoe UI', Arial, sans-serif; }
    `,
        customSiteTitle: "Sales Insight Automator — API Docs",
        customfavIcon: "https://em-content.zobj.net/source/twitter/376/bar-chart_1f4ca.png",
        swaggerOptions: {
            persistAuthorization: true,
        },
    })
);

// Expose swagger JSON
app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/analyze", analyzeRoutes);

// ─────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error("[Global Error]", err.stack || err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});

module.exports = app;
