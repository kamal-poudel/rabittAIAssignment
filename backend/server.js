require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Validate required environment variables on startup
const REQUIRED_ENV = ["MONGO_URI", "JWT_SECRET", "GEMINI_API_KEY", "EMAIL_USER", "EMAIL_PASS"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missing.length > 0) {
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("❌  MISSING REQUIRED ENVIRONMENT VARIABLES:");
    missing.forEach((key) => console.error(`   • ${key}`));
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.error("Copy .env.example to .env and fill in all values before starting.");
    process.exit(1);
}

const server = app.listen(PORT, () => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🚀  Sales Insight Automator API`);
    console.log(`🌐  Server:   http://localhost:${PORT}`);
    console.log(`📚  API Docs: http://localhost:${PORT}/docs`);
    console.log(`🏥  Health:   http://localhost:${PORT}/health`);
    console.log(`🌍  Env:      ${process.env.NODE_ENV || "development"}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n🔴 ${signal} received. Shutting down gracefully...`);
    server.close(() => {
        console.log("✅ HTTP server closed.");
        process.exit(0);
    });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Promise Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});

module.exports = server;
