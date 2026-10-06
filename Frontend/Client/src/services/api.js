import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({ baseURL: API });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes("/auth/")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const summarizeText = (data) => apiClient.post("/summarize", data);
export const generateQuiz = (text, difficulty, questionCount, customPrompt = false) =>
  apiClient.post("/quiz", { text, difficulty, questionCount, customPrompt });
export const saveScore = (data) => apiClient.post("/scores", data);
export const getScores = () => apiClient.get("/scores");
export const getMyScores = () => apiClient.get("/scores/mine");
export const getHistory = (page = 1, limit = 10) =>
  apiClient.get(`/history?page=${page}&limit=${limit}`);
export const deleteHistory = (id) => apiClient.delete(`/history/${id}`);
export const updateHistory = (id, data) => apiClient.put(`/history/${id}`, data);
export const getProfile = () => apiClient.get("/auth/me");
export const updateProfile = (data) => apiClient.put("/auth/me", data);
export const changePassword = (data) => apiClient.put("/auth/password", data);
export const deleteAccount = () => apiClient.delete("/auth/me");
