import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Eye, EyeOff, BarChart3, Loader2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";

export default function Signup({ onLogin }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Full name is required";
        else if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
        if (!form.email) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email address";
        if (!form.password) e.password = "Password is required";
        else if (form.password.length < 6) e.password = "Password must be at least 6 characters";
        if (form.password !== form.confirm) e.confirm = "Passwords do not match";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const { data } = await authAPI.signup({
                name: form.name.trim(),
                email: form.email,
                password: form.password,
            });
            localStorage.setItem("sia_token", data.token);
            localStorage.setItem("sia_user", JSON.stringify(data.user));
            toast.success(`Account created! Welcome, ${data.user.name} 🎉`);
            onLogin(data.user);
            navigate("/dashboard");
        } catch (err) {
            const msg = err.response?.data?.message || "Signup failed. Please try again.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        const p = form.password;
        if (!p) return null;
        if (p.length < 6) return { label: "Too short", color: "bg-red-500", width: "20%" };
        if (p.length < 8) return { label: "Weak", color: "bg-orange-500", width: "40%" };
        if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: "Fair", color: "bg-yellow-500", width: "65%" };
        return { label: "Strong", color: "bg-green-500", width: "100%" };
    };

    const strength = getPasswordStrength();

    return (
        <div className="min-h-screen bg-grid flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background glow orbs */}
            <div className="glow-orb w-80 h-80 bg-brand-600/20 -top-10 -right-10" />
            <div className="glow-orb w-96 h-96 bg-brand-500/10 -bottom-20 -left-20" />

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
                        <h2 className="text-xl font-semibold text-white">Create your account</h2>
                        <p className="text-white/50 text-sm mt-1">Start analyzing your sales data with AI</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        {/* Name */}
                        <div className="form-group">
                            <label htmlFor="signup-name" className="form-label">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    id="signup-name"
                                    type="text"
                                    autoComplete="name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className={`input-field pl-10 ${errors.name ? "border-red-500/50" : ""}`}
                                    placeholder="Jane Smith"
                                />
                            </div>
                            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label htmlFor="signup-email" className="form-label">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    id="signup-email"
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
                            <label htmlFor="signup-password" className="form-label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    id="signup-password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className={`input-field pl-10 pr-11 ${errors.password ? "border-red-500/50" : ""}`}
                                    placeholder="Min. 6 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {/* Password strength bar */}
                            {strength && (
                                <div className="mt-2">
                                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${strength.color}`}
                                            style={{ width: strength.width }}
                                        />
                                    </div>
                                    <p className="text-xs mt-1 text-white/40">{strength.label}</p>
                                </div>
                            )}
                            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="form-group">
                            <label htmlFor="signup-confirm" className="form-label">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    id="signup-confirm"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    value={form.confirm}
                                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                                    className={`input-field pl-10 ${errors.confirm ? "border-red-500/50" : ""}`}
                                    placeholder="Repeat password"
                                />
                            </div>
                            {errors.confirm && <p className="text-red-400 text-xs mt-1">{errors.confirm}</p>}
                        </div>

                        {/* Submit */}
                        <button
                            id="signup-submit-btn"
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                                ) : (
                                    <><UserPlus className="w-4 h-4" /> Create Account</>
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
                                Already have an account?
                            </span>
                        </div>
                    </div>

                    <Link
                        to="/login"
                        id="goto-login-link"
                        className="btn-ghost w-full flex items-center justify-center text-sm"
                    >
                        Sign in instead →
                    </Link>
                </div>
            </div>
        </div>
    );
}
