import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        try {
            const token = localStorage.getItem("sia_token");
            const storedUser = localStorage.getItem("sia_user");
            if (token && storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch {
            localStorage.removeItem("sia_token");
            localStorage.removeItem("sia_user");
        } finally {
            setLoading(false);
        }
    }, []);

    // Listen for auto-logout events (401 from API)
    useEffect(() => {
        const handleLogout = () => {
            setUser(null);
        };
        window.addEventListener("auth:logout", handleLogout);
        return () => window.removeEventListener("auth:logout", handleLogout);
    }, []);

    const handleLogin = (userData) => setUser(userData);

    const handleLogout = () => {
        localStorage.removeItem("sia_token");
        localStorage.removeItem("sia_user");
        setUser(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-grid flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                containerStyle={{ top: 20, right: 20 }}
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: "rgba(15, 0, 53, 0.95)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(124, 58, 237, 0.3)",
                        color: "#e2e8f0",
                        borderRadius: "12px",
                        fontSize: "14px",
                        fontFamily: "Inter, sans-serif",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                    },
                    success: {
                        iconTheme: { primary: "#4ade80", secondary: "transparent" },
                    },
                    error: {
                        iconTheme: { primary: "#f87171", secondary: "transparent" },
                    },
                }}
            />

            <Routes>
                <Route
                    path="/"
                    element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/login"
                    element={user ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
                />
                <Route
                    path="/signup"
                    element={user ? <Navigate to="/dashboard" replace /> : <Signup onLogin={handleLogin} />}
                />
                <Route
                    path="/dashboard"
                    element={
                        user ? (
                            <Dashboard user={user} onLogout={handleLogout} />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />
                {/* Catch-all → redirect */}
                <Route
                    path="*"
                    element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}
