import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, BarChart3, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";

export default function Login({ onLogin }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.email) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email address";
        if (!form.password) e.password = "Password is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const { data } = await authAPI.login(form);
            localStorage.setItem("sia_token", data.token);
            localStorage.setItem("sia_user", JSON.stringify(data.user));
            toast.success(`Welcome back, ${data.user.name}!`);
            onLogin(data.user);
            navigate("/dashboard");
        } catch (err) {
            const msg = err.response?.data?.message || "Login failed. Please try again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-grid flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background glow orbs */}
            <div className="glow-orb w-96 h-96 bg-brand-600/20 -top-20 -left-20" />
            <div className="glow-orb w-80 h-80 bg-brand-500/15 -bottom-10 -right-10" />
            <div className="glow-orb w-64 h-64 bg-purple-900/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

            <div className="w-full max-w-md page-enter">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #5b21b6)" }}>
                        <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">Sales Insight</h1>
                    <p className="text-white/40 mt-1 text-sm">Automator</p>
                </div>

                {/* Card */}
                <div className="glass-card rounded-2xl p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-white">Sign in to your account</h2>
                        <p className="text-white/50 text-sm mt-1">Enter your credentials to access the dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="login-email" className="form-label">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    id="login-email"
                                    type="email"
                                    autoComplete="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className={`input-field pl-10 ${errors.email ? "border-red-500/50" : ""}`}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label htmlFor="login-password" className="form-label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className={`input-field pl-10 pr-11 ${errors.password ? "border-red-500/50" : ""}`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                        </div>

                        {/* Submit */}
                        <button
                            id="login-submit-btn"
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                                ) : (
                                    <><Sparkles className="w-4 h-4" /> Sign In</>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs text-white/30">
                            <span className="px-3" style={{ background: "rgba(255,255,255,0.04)" }}>
                                Don&apos;t have an account?
                            </span>
                        </div>
                    </div>

                    <Link
                        to="/signup"
                        id="goto-signup-link"
                        className="btn-ghost w-full flex items-center justify-center text-sm"
                    >
                        Create a free account →
                    </Link>
                </div>

                {/* Demo hint */}
                <p className="text-center text-white/25 text-xs mt-6">
                    Sign up first to create your account — no credit card required
                </p>
            </div>
        </div>
    );
}
