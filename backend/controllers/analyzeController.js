const { validationResult } = require("express-validator");
const { parseFile, rowsToText } = require("../services/fileParser");
const { generateSalesSummary } = require("../services/aiService");
const { sendSummaryEmail } = require("../services/emailService");

/**
 * POST /api/analyze
 * Protected route — Accepts multipart/form-data with file + email
 * Parses file → Generates AI summary → Sends email → Returns result
 */
const analyzeFile = async (req, res) => {
    try {
        // 1. Validate form fields
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        // 2. Check file presence
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded. Please attach a .csv or .xlsx file.",
            });
        }

        const { email: recipientEmail } = req.body;
        const { buffer, originalname, size } = req.file;

        console.log(
            `[Analyze] User: ${req.user.email} | File: ${originalname} | Size: ${(size / 1024).toFixed(2)} KB | Recipient: ${recipientEmail}`
        );

        // 3. Parse the uploaded file
        let rows;
        try {
            rows = await parseFile(buffer, originalname);
        } catch (parseError) {
            return res.status(422).json({
                success: false,
                message: `File parsing failed: ${parseError.message}`,
            });
        }

        if (rows.length === 0) {
            return res.status(422).json({
                success: false,
                message: "The uploaded file contains no data rows.",
            });
        }

        console.log(`[Analyze] Parsed ${rows.length} rows successfully`);

        // 4. Convert rows to text context for AI
        const salesDataText = rowsToText(rows);

        // 5. Generate AI summary
        let summary;
        try {
            summary = await generateSalesSummary(salesDataText, rows.length);
        } catch (aiError) {
            return res.status(502).json({
                success: false,
                message: `AI analysis failed: ${aiError.message}`,
            });
        }

        console.log(`[Analyze] AI summary generated (${summary.length} chars)`);

        // 6. Send email
        try {
            await sendSummaryEmail(recipientEmail, summary, req.user.name);
        } catch (emailError) {
            // Email failure should not block the response — return summary but warn
            console.error("[Analyze] Email send failed:", emailError.message);
            return res.status(207).json({
                success: true,
                message: "Analysis complete but email delivery failed. See summary below.",
                summary,
                recordsProcessed: rows.length,
                emailSentTo: null,
                emailError: emailError.message,
            });
        }

        console.log(`[Analyze] Email sent to ${recipientEmail}`);

        // 7. Return success
        return res.status(200).json({
            success: true,
            message: "Analysis complete and report sent successfully",
            summary,
            recordsProcessed: rows.length,
            emailSentTo: recipientEmail,
        });
    } catch (error) {
        console.error("[Analyze] Unexpected error:", error);
        return res.status(500).json({
            success: false,
            message: "An unexpected error occurred. Please try again.",
        });
    }
};

module.exports = { analyzeFile };
