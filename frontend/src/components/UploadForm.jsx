import { useState, useRef } from "react";
import {
    Upload, FileSpreadsheet, Mail, X, CheckCircle2,
    AlertCircle, Loader2, FileType2, Info
} from "lucide-react";
import toast from "react-hot-toast";
import { analyzeAPI } from "../services/api";
import ReactMarkdown from "react-markdown";

const MAX_SIZE_MB = 5;
const ALLOWED_EXTENSIONS = [".csv", ".xlsx"];

export default function UploadForm() {
    const [file, setFile] = useState(null);
    const [email, setEmail] = useState("");
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [result, setResult] = useState(null); // { success, summary, recordsProcessed, emailSentTo, error }
    const [emailError, setEmailError] = useState("");
    const fileInputRef = useRef(null);

    // ─── File Validation ─────────────────────────────────────────────
    const validateFile = (f) => {
        if (!f) return "Please select a file.";
        const ext = "." + f.name.split(".").pop().toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) return `Invalid file type. Use CSV or XLSX only.`;
        if (f.size > MAX_SIZE_MB * 1024 * 1024) return `File too large. Max ${MAX_SIZE_MB}MB allowed.`;
        return null;
    };

    const handleFileSelect = (f) => {
        const err = validateFile(f);
        if (err) { toast.error(err); return; }
        setFile(f);
        setResult(null);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFileSelect(f);
    };

    const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
    const handleDragLeave = () => setDragging(false);

    // ─── Email Validation ─────────────────────────────────────────────
    const validateEmail = (val) => {
        if (!val) return "Recipient email is required";
        if (!/\S+@\S+\.\S+/.test(val)) return "Invalid email address";
        return "";
    };

    // ─── Submit ──────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();

        const fileErr = validateFile(file);
        if (fileErr) { toast.error(fileErr); return; }

        const emailErr = validateEmail(email);
        if (emailErr) { setEmailError(emailErr); return; }
        setEmailError("");

        setLoading(true);
        setUploadProgress(0);
        setResult(null);

        try {
            const { data } = await analyzeAPI.analyze(file, email, (p) => setUploadProgress(p));
            setResult({
                success: true,
                summary: data.summary,
                recordsProcessed: data.recordsProcessed,
                emailSentTo: data.emailSentTo,
                emailError: data.emailError,
                message: data.message,
            });
            toast.success("Analysis complete! Report sent 🎉");
        } catch (err) {
            const msg = err.response?.data?.message || "Analysis failed. Please try again.";
            setResult({ success: false, error: msg });
            toast.error(msg);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const reset = () => {
        setFile(null);
        setEmail("");
        setResult(null);
        setEmailError("");
    };

    // ─── File size formatter ──────────────────────────────────────────
    const formatSize = (bytes) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <div className="space-y-6">
            {/* ─── Upload Form ─────────────────────────────────────────── */}
            {!result && (
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Drop Zone */}
                    <div
                        className={`drop-zone glass-card rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${dragging
                                ? "border-brand-400 bg-brand-500/10 drag-over"
                                : file
                                    ? "border-brand-500/50"
                                    : "border-white/15 hover:border-brand-500/40"
                            }`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => !file && fileInputRef.current?.click()}
                        role="button"
                        aria-label="Upload sales data file"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            id="file-upload-input"
                            type="file"
                            accept=".csv,.xlsx"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e.target.files[0])}
                        />

                        {file ? (
                            // File selected state
                            <div className="flex items-center justify-between p-3 glass-card rounded-xl text-left">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: "linear-gradient(135deg, #7c3aed20, #5b21b620)", border: "1px solid rgba(124,58,237,0.3)" }}>
                                        <FileSpreadsheet className="w-5 h-5 text-brand-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white truncate max-w-xs">{file.name}</p>
                                        <p className="text-xs text-white/40">{formatSize(file.size)}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                                    aria-label="Remove file"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            // Empty state
                            <div className="py-4">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                                    style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)" }}>
                                    <Upload className={`w-6 h-6 text-brand-400 transition-transform duration-300 ${dragging ? "scale-110 -translate-y-1" : ""}`} />
                                </div>
                                <p className="text-white/70 font-medium">Drop your file here, or click to browse</p>
                                <p className="text-white/30 text-sm mt-1">Supports CSV and XLSX · Max {MAX_SIZE_MB}MB</p>
                                <div className="flex items-center justify-center gap-3 mt-4">
                                    {ALLOWED_EXTENSIONS.map((ext) => (
                                        <span key={ext} className="badge-info flex items-center gap-1">
                                            <FileType2 className="w-3 h-3" />
                                            {ext.toUpperCase().slice(1)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Recipient Email */}
                    <div className="form-group">
                        <label htmlFor="recipient-email" className="form-label">
                            Recipient Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                                id="recipient-email"
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                                className={`input-field pl-10 ${emailError ? "border-red-500/50" : ""}`}
                                placeholder="report@company.com"
                            />
                        </div>
                        {emailError && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {emailError}
                            </p>
                        )}
                        <p className="text-white/25 text-xs mt-1 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            The AI-generated report will be emailed to this address
                        </p>
                    </div>

                    {/* Progress bar (during upload) */}
                    {loading && uploadProgress > 0 && uploadProgress < 100 && (
                        <div>
                            <div className="flex justify-between text-xs text-white/40 mb-1.5">
                                <span>Uploading file...</span>
                                <span>{uploadProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                        width: `${uploadProgress}%`,
                                        background: "linear-gradient(90deg, #7c3aed, #a78bfa)",
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {/* AI Processing indicator */}
                    {loading && (uploadProgress === 0 || uploadProgress === 100) && (
                        <div className="glass-card rounded-xl p-4 flex items-center gap-3">
                            <div className="relative">
                                <Loader2 className="w-5 h-5 text-brand-400 animate-spin" />
                            </div>
                            <div>
                                <p className="text-sm text-white font-medium">
                                    {uploadProgress < 100 ? "Uploading file..." : "Gemini AI is analyzing your data..."}
                                </p>
                                <p className="text-xs text-white/40 mt-0.5">This may take 15–30 seconds</p>
                            </div>
                            <div className="ml-auto flex gap-1">
                                {[0, 1, 2].map((i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 h-1.5 rounded-full bg-brand-400"
                                        style={{ animation: `pulse 1.4s ${i * 0.2}s ease-in-out infinite` }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        id="analyze-submit-btn"
                        type="submit"
                        disabled={loading || !file}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                            ) : (
                                <><Upload className="w-4 h-4" /> Analyze & Send Report</>
                            )}
                        </span>
                    </button>
                </form>
            )}

            {/* ─── Results ─────────────────────────────────────────────── */}
            {result && (
                <div className="space-y-5 page-enter">
                    {/* Status Banner */}
                    {result.success ? (
                        <div className="glass-card rounded-xl p-4 border border-green-500/20">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-green-300">{result.message}</p>
                                    <div className="flex flex-wrap gap-3 mt-2">
                                        <span className="badge-success">
                                            {result.recordsProcessed} records processed
                                        </span>
                                        {result.emailSentTo && (
                                            <span className="badge-success">
                                                <Mail className="w-3 h-3" /> {result.emailSentTo}
                                            </span>
                                        )}
                                    </div>
                                    {result.emailError && (
                                        <p className="text-xs text-orange-300 mt-2 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> Email failed: {result.emailError}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card rounded-xl p-4 border border-red-500/20">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-300">{result.error}</p>
                            </div>
                        </div>
                    )}

                    {/* AI Summary */}
                    {result.summary && (
                        <div className="glass-card rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
                                    <span className="text-white text-xs font-bold">AI</span>
                                </div>
                                <h3 className="text-sm font-semibold text-white/80">Executive Sales Summary</h3>
                                <span className="ml-auto badge-info text-xs">Powered by Gemini</span>
                            </div>
                            <div className="prose-summary overflow-y-auto max-h-[500px] pr-2">
                                <ReactMarkdown>{result.summary}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {/* Reset */}
                    <button
                        id="analyze-again-btn"
                        onClick={reset}
                        className="btn-ghost w-full flex items-center justify-center gap-2 text-sm"
                    >
                        ← Analyze Another File
                    </button>
                </div>
            )}
        </div>
    );
}
