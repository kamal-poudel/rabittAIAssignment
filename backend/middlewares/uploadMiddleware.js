const multer = require("multer");
const path = require("path");

// Use memory storage — no disk writes, safer in serverless/container envs
const storage = multer.memoryStorage();

/**
 * File filter — only allow .csv and .xlsx files
 */
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/csv",
        "text/plain", // some OS/browsers send CSV as text/plain
    ];

    const allowedExtensions = [".csv", ".xlsx"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(
            new Error("Invalid file type. Only CSV (.csv) and Excel (.xlsx) files are allowed."),
            false
        );
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB hard limit
        files: 1,                   // Only one file per request
    },
    fileFilter,
});

/**
 * Wrap multer errors in a consistent JSON response
 */
const handleUploadErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File too large. Maximum allowed size is 5MB.",
            });
        }
        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                success: false,
                message: "Too many files. Only one file upload is allowed per request.",
            });
        }
        return res.status(400).json({ success: false, message: err.message });
    }

    if (err) {
        return res.status(400).json({ success: false, message: err.message });
    }

    next();
};

module.exports = { upload, handleUploadErrors };
