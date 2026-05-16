import axios from "axios";

const API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/auth`
  : "http://localhost:5000/api/auth";

const authClient = axios.create({ baseURL: API });

authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = (data) => authClient.post("/login", data);
export const registerUser = (data) => authClient.post("/register", data);
