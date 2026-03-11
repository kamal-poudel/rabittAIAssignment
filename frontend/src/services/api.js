import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 120000, // 120s max for AI processing and Email SMTP delivery
    headers: {
        "Content-Type": "application/json",
    },
});

// ─── Request Interceptor: Attach JWT ───────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("sia_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response Interceptor: Global Error Handling ──────────────────
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Auto-logout on token expiry
            localStorage.removeItem("sia_token");
            localStorage.removeItem("sia_user");
            window.dispatchEvent(new CustomEvent("auth:logout"));
        }
        return Promise.reject(error);
    }
);

// ─── Auth API ─────────────────────────────────────────────────────
export const authAPI = {
    signup: (data) => api.post("/auth/signup", data),
    login: (data) => api.post("/auth/login", data),
    getMe: () => api.get("/auth/me"),
};

// ─── Analysis API ─────────────────────────────────────────────────
export const analyzeAPI = {
    /**
     * Upload a sales file and request AI analysis
     * @param {File} file - CSV or XLSX file
     * @param {string} email - Recipient email
     * @param {Function} onProgress - Upload progress callback (0–100)
     */
    analyze: (file, email, onProgress) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("email", email);

        return api.post("/analyze", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (evt) => {
                if (evt.total && onProgress) {
                    onProgress(Math.round((evt.loaded * 100) / evt.total));
                }
            },
        });
    },
};

export default api;
