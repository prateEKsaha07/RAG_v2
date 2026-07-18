import axios from "axios";
const API = import.meta.env.VITE_API_URL;

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  },
});

export const getSubjects = async () => {
  const response = await axios.get(
    `${API}/subjects`,
    authHeaders()
  );

  return response.data.subjects;
};

export const getAnalytics = async (subject) => {
  const response = await axios.get(
    `${API}/analytics/${subject}`,
    authHeaders()
  );

  return response.data;
};