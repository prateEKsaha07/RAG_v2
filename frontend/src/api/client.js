import axios from "axios";
import { supabase } from "../supabaseClient";
const API = import.meta.env.VITE_API_URL;
const apiClient = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }
  const token = data.session?.access_token;
  if (!token) {
    throw new Error("You are not authenticated. Please log in.");
  }
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong.";

    return Promise.reject(new Error(message));
  }
);

export async function wake_backend() {
  const response = await fetch(`${API}/health`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to wake the backend");
  }

  return data;
}

export default apiClient;
