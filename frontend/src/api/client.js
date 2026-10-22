import axios from "axios";
const API = import.meta.env.VITE_API_URL;


export async function wake_backend() {
    const response  = await fetch(`${API}/health`)
    const data = await response.json();
    console.log(data)
    if (!response.ok) {
        throw new Error(data.detail || "Failed to wake the backend");
    }
  return data;
}