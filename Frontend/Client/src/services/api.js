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

export const summarizeText = (data) => apiClient.post("/summarize", data);
export const generateQuiz = (text, difficulty, questionCount) =>
  apiClient.post("/quiz", { text, difficulty, questionCount });
export const saveScore = (data) => apiClient.post("/scores", data);
export const getScores = () => apiClient.get("/scores");
export const getHistory = (page = 1, limit = 10) =>
  apiClient.get(`/history?page=${page}&limit=${limit}`);
export const deleteHistory = (id) => apiClient.delete(`/history/${id}`);
export const updateHistory = (id, data) => apiClient.put(`/history/${id}`, data);
export const getProfile = () => apiClient.get("/auth/me");
export const updateProfile = (data) => apiClient.put("/auth/me", data);
