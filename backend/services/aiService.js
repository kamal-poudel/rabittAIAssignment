const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;

/**
 * Lazy-initialize Gemini client to respect env loading order
 */
const getGenAI = () => {
    if (!genAI) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured in environment variables.");
        }
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return genAI;
};

/**
 * Generate an executive sales summary from structured sales data text
 * @param {string} salesDataText - Human-readable sales data (from fileParser.rowsToText)
 * @param {number} totalRecords - Total number of records in the file
 * @returns {Promise<string>} AI-generated executive summary
 */
const generateSalesSummary = async (salesDataText, totalRecords) => {
    const client = getGenAI();
    const model = client.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a senior business analyst preparing an executive board report.

Analyze the following sales data and generate a professional executive summary.

Your summary MUST include:
1. **Overall Performance Overview** – Total revenue, units sold, and general trend
2. **Top Performing Products/Categories** – Which categories drove the most revenue
3. **Regional Analysis** – Geographic performance breakdown
4. **Key KPIs** – Revenue per unit, average order value, success rate
5. **Trend Insights** – Month-over-month or period-over-period changes if dates are present
6. **Strategic Recommendations** – 2-3 actionable recommendations based on the data

Format the output in clear markdown with headers and bullet points.
Be precise, data-driven, and avoid generic filler statements.

SALES DATA:
${salesDataText}

Total records analyzed: ${totalRecords}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        if (!text || text.trim().length === 0) {
            throw new Error("Gemini returned an empty response.");
        }

        return text.trim();
    } catch (error) {
        if (error.message?.includes("API_KEY_INVALID")) {
            throw new Error("Invalid Gemini API key. Please check your GEMINI_API_KEY configuration.");
        }
        if (error.message?.includes("SAFETY")) {
            throw new Error("Content was blocked by Gemini safety filters.");
        }
        throw new Error(`AI analysis failed: ${error.message}`);
    }
};

module.exports = { generateSalesSummary };
