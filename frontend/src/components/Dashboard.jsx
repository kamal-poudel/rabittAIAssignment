import { useState } from "react";
import {
    BarChart3, LogOut, User, FileSpreadsheet,
    Zap, ChevronRight, Mail, Shield, BookOpen
} from "lucide-react";
import UploadForm from "./UploadForm";

const FEATURE_CARDS = [
    {
        icon: FileSpreadsheet,
        title: "Smart File Parsing",
        desc: "Upload CSV or XLSX sales data. We handle parsing and validation automatically.",
        color: "#7c3aed",
    },
    {
        icon: Zap,
        title: "Gemini AI Analysis",
        desc: "Google Gemini reads your data and generates executive-level insights within seconds.",
        color: "#6d28d9",
    },
    {
        icon: Mail,
        title: "Instant Email Delivery",
        desc: "The AI-generated report is formatted and sent directly to your chosen inbox.",
        color: "#5b21b6",
    },
];

export default function Dashboard({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("analyze");

    return (
        <div className="min-h-screen bg-grid relative">
            {/* Background decorations */}
            <div className="glow-orb w-96 h-96 bg-brand-700/15 -top-32 -right-32 pointer-events-none" />
            <div className="glow-orb w-64 h-64 bg-brand-600/10 bottom-20 left-10 pointer-events-none" />

            {/* ─── Navbar ─────────────────────────────────────────────── */}
            <nav className="glass-card border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-white text-sm">Sales Insight</span>
                            <span className="text-white/40 text-xs ml-1.5">Automator</span>
                        </div>
                    </div>

                    {/* Nav items */}
                    <div className="hidden sm:flex items-center gap-1">
                        {[
                            { id: "analyze", label: "Analyze", icon: Zap },
                            { id: "docs", label: "API Docs", icon: BookOpen },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                id={`nav-${id}`}
                                onClick={() =>
                                    id === "docs"
                                        ? window.open("/docs", "_blank")
                                        : setActiveTab(id)
                                }
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${activeTab === id && id !== "docs"
                                        ? "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                                        : "text-white/50 hover:text-white/80 hover:bg-white/5"
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* User menu */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
                                {user?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                            <div className="hidden md:block">
                                <p className="text-xs font-medium text-white/80">{user?.name}</p>
                                <p className="text-xs text-white/35 truncate max-w-[140px]">{user?.email}</p>
                            </div>
                        </div>
                        <button
                            id="logout-btn"
                            onClick={onLogout}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border border-transparent hover:border-red-500/20"
                            title="Sign out"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Sign out</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                {/* ─── Welcome Header ───────────────────────────────────── */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="badge-info text-xs flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Authenticated
                        </span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold">
                        <span className="text-white">Welcome back, </span>
                        <span className="gradient-text">{user?.name?.split(" ")[0]}</span>
                    </h1>
                    <p className="text-white/45 mt-2 text-base">
                        Upload your sales data to generate AI-powered executive summaries
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ─── Main Upload Panel ─────────────────────────────── */}
                    <div className="lg:col-span-2">
                        <div className="glass-card rounded-2xl p-6 sm:p-8">
                            {/* Panel header */}
                            <div className="flex items-center gap-3 mb-7">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(91,33,182,0.3))", border: "1px solid rgba(124,58,237,0.4)" }}>
                                    <Zap className="w-5 h-5 text-brand-300" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-white">AI Sales Analyzer</h2>
                                    <p className="text-xs text-white/40">Upload • Analyze • Deliver</p>
                                </div>
                            </div>

                            <UploadForm />
                        </div>
                    </div>

                    {/* ─── Sidebar ───────────────────────────────────────── */}
                    <div className="space-y-5">
                        {/* Feature cards */}
                        {FEATURE_CARDS.map(({ icon: Icon, title, desc, color }) => (
                            <div
                                key={title}
                                className="glass-card rounded-xl p-5 flex gap-4 items-start transition-all duration-300 hover:border-brand-500/30 cursor-default"
                            >
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                    style={{
                                        background: `${color}18`,
                                        border: `1px solid ${color}40`,
                                    }}
                                >
                                    <Icon className="w-5 h-5" style={{ color }} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white/90">{title}</p>
                                    <p className="text-xs text-white/40 mt-1 leading-relaxed">{desc}</p>
                                </div>
                            </div>
                        ))}

                        {/* Quick tips */}
                        <div className="glass-card rounded-xl p-5 border border-brand-500/20">
                            <p className="text-xs font-semibold text-brand-300 mb-3 uppercase tracking-wider">
                                💡 Quick Tips
                            </p>
                            {[
                                "Include headers in row 1 of your CSV/XLSX",
                                "Columns like Revenue, Units, Date improve accuracy",
                                "Up to 200 rows used for AI context",
                                "The email report includes full markdown formatting",
                            ].map((tip, i) => (
                                <div key={i} className="flex items-start gap-2 mb-2 last:mb-0">
                                    <ChevronRight className="w-3 h-3 text-brand-400 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-white/50">{tip}</p>
                                </div>
                            ))}
                        </div>

                        {/* User info card */}
                        <div className="glass-card rounded-xl p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white"
                                    style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
                                    {user?.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{user?.name}</p>
                                    <p className="text-xs text-white/40">{user?.email}</p>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                                <User className="w-3.5 h-3.5 text-brand-400" />
                                <p className="text-xs text-white/40">JWT session active · expires in 24h</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
