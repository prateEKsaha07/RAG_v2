
const API = import.meta.env.VITE_API_URL;
const getToken = () => localStorage.getItem("access_token");

export async function getMyProfile() {
  const response = await fetch(`${API}/profiles/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to fetch profile data");
  }
  const data = await response.json();

  return Array.isArray(data) ? data[0] : data;
}

export async function updateMyProfile(updateData) {
  const response = await fetch(`${API}/profiles/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || "Failed to update profile data");
  }
  const data = await response.json();
  return Array.isArray(data) ? data[0] : data;
}
