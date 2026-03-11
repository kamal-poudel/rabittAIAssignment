const router = require("express").Router();
const { body } = require("express-validator");
const { analyzeFile } = require("../controllers/analyzeController");
const authMiddleware = require("../middlewares/authMiddleware");
const { upload, handleUploadErrors } = require("../middlewares/uploadMiddleware");

/**
 * @openapi
 * tags:
 *   name: Analysis
 *   description: Sales data analysis endpoints
 */

/**
 * @openapi
 * /api/analyze:
 *   post:
 *     summary: Upload sales data file and get an AI-generated executive summary sent via email
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - email
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Sales data file (.csv or .xlsx, max 5MB)
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Recipient email address for the generated report
 *                 example: recipient@example.com
 *     responses:
 *       200:
 *         description: Analysis complete — summary generated and email sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyzeResponse'
 *       207:
 *         description: Analysis succeeded but email delivery failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 summary: { type: string }
 *                 emailError: { type: string }
 *       400:
 *         description: Validation error or missing file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized — JWT token missing or invalid
 *       422:
 *         description: File parsing failed or empty data
 *       502:
 *         description: AI analysis failed
 */
router.post(
    "/",
    authMiddleware,
    (req, res, next) => upload.single("file")(req, res, (err) => handleUploadErrors(err, req, res, next)),
    [
        body("email")
            .trim()
            .notEmpty().withMessage("Recipient email is required")
            .isEmail().withMessage("Invalid recipient email address")
            .normalizeEmail(),
    ],
    analyzeFile
);

module.exports = router;
