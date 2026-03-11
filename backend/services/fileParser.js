const csv = require("csv-parser");
const xlsx = require("xlsx");
const { Readable } = require("stream");
const path = require("path");

/**
 * Parse CSV buffer into an array of row objects
 * @param {Buffer} buffer - File content buffer
 * @returns {Promise<Array<Object>>} Parsed rows
 */
const parseCSV = (buffer) => {
    return new Promise((resolve, reject) => {
        const rows = [];
        const stream = Readable.from(buffer.toString("utf-8"));

        stream
            .pipe(
                csv({
                    mapHeaders: ({ header }) => header.trim(),
                    mapValues: ({ value }) => value.trim(),
                })
            )
            .on("data", (row) => rows.push(row))
            .on("end", () => {
                if (rows.length === 0) {
                    reject(new Error("CSV file is empty or has no data rows."));
                } else {
                    resolve(rows);
                }
            })
            .on("error", (err) => reject(new Error(`CSV parsing failed: ${err.message}`)));
    });
};

/**
 * Parse XLSX buffer into an array of row objects
 * @param {Buffer} buffer - File content buffer
 * @returns {Promise<Array<Object>>} Parsed rows
 */
const parseXLSX = (buffer) => {
    return new Promise((resolve, reject) => {
        try {
            const workbook = xlsx.read(buffer, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];

            if (!sheetName) {
                return reject(new Error("XLSX file has no sheets."));
            }

            const worksheet = workbook.Sheets[sheetName];
            const rows = xlsx.utils.sheet_to_json(worksheet, {
                defval: "",       // Default empty cells to empty string
                raw: false,       // Format all values as strings for consistency
            });

            if (rows.length === 0) {
                return reject(new Error("XLSX file is empty or has no data rows."));
            }

            resolve(rows);
        } catch (err) {
            reject(new Error(`XLSX parsing failed: ${err.message}`));
        }
    });
};

/**
 * Parse an uploaded file buffer based on its extension
 * @param {Buffer} buffer - File content buffer
 * @param {string} originalname - Original filename (used for extension detection)
 * @returns {Promise<Array<Object>>} Parsed rows
 */
const parseFile = async (buffer, originalname) => {
    const ext = path.extname(originalname).toLowerCase();

    if (ext === ".csv") {
        return parseCSV(buffer);
    } else if (ext === ".xlsx" || ext === ".xls") {
        return parseXLSX(buffer);
    } else {
        throw new Error(`Unsupported file extension: ${ext}. Use .csv or .xlsx`);
    }
};

/**
 * Convert parsed rows to a human-readable text block for AI context
 * Limits to 200 rows to avoid token overflow
 * @param {Array<Object>} rows
 * @returns {string}
 */
const rowsToText = (rows) => {
    const MAX_ROWS = 200;
    const sample = rows.slice(0, MAX_ROWS);
    const headers = Object.keys(sample[0]);

    const lines = [
        `Total records in file: ${rows.length}`,
        `Columns: ${headers.join(", ")}`,
        ``,
        `--- Data Sample (first ${sample.length} rows) ---`,
        headers.join(" | "),
        ...sample.map((row) => headers.map((h) => row[h] ?? "").join(" | ")),
    ];

    return lines.join("\n");
};

module.exports = { parseFile, rowsToText };
