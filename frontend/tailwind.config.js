/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "system-ui", "Arial", "sans-serif"],
            },
            colors: {
                brand: {
                    50: "#f0edff",
                    100: "#e0d9ff",
                    200: "#c4b5fd",
                    300: "#a78bfa",
                    400: "#8b5cf6",
                    500: "#7c3aed",
                    600: "#6d28d9",
                    700: "#5b21b6",
                    800: "#4c1d95",
                    900: "#2e1065",
                },
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.4s ease-out",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                "spin-slow": "spin 3s linear infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "hero-gradient":
                    "linear-gradient(135deg, #0f0035 0%, #1a0050 30%, #0d001f 60%, #050010 100%)",
            },
            boxShadow: {
                glow: "0 0 30px rgba(124, 58, 237, 0.4)",
                "glow-lg": "0 0 60px rgba(124, 58, 237, 0.3)",
                glass: "0 8px 32px rgba(0, 0, 0, 0.37)",
            },
            backdropBlur: {
                xs: "2px",
            },
        },
    },
    plugins: [],
};
