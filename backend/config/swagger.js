const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Sales Insight Automator API",
      version: "1.0.0",
      description:
        "AI-powered sales data analysis API that processes CSV/XLSX files, generates executive summaries using Google Gemini, and delivers them via email.",
      contact: {
        name: "Sales Insight Automator",
        email: "support@salesinsight.ai",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}`,
        description: "Local Development Server",
      },
      {
        url: "https://your-backend.onrender.com",
        description: "Production Server (Render)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token obtained from /api/auth/login",
        },
      },
      schemas: {
        SignupRequest: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              example: "John Doe",
              description: "Full name of the user",
            },
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "SecurePassword123",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
            password: {
              type: "string",
              example: "SecurePassword123",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Login successful" },
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            user: {
              type: "object",
              properties: {
                id: { type: "string", example: "user_1741699394000" },
                name: { type: "string", example: "John Doe" },
                email: {
                  type: "string",
                  example: "john@example.com",
                },
              },
            },
          },
        },
        AnalyzeResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: {
              type: "string",
              example: "Analysis complete and email sent successfully",
            },
            summary: {
              type: "string",
              example: "Executive Sales Summary: Q1 revenue grew by 23%...",
            },
            recordsProcessed: { type: "number", example: 150 },
            emailSentTo: {
              type: "string",
              example: "recipient@example.com",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "An error occurred" },
            errors: {
              type: "array",
              items: { type: "object" },
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options);
