import React, { useState } from "react";
import { updateMyProfile } from "../../api/profiles"; // Ensure this path matches your project structure

export default function UpdateScreen({ profile, setProfile, onBack }) {
  // Local state to manage form input fields
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Build the payload with the modified values
    const payload = {
      display_name: displayName,
      username: username,
      bio: bio,
    };

    try {
      // Hit the FastAPI PATCH endpoint via your API layer
      const updatedData = await updateMyProfile(payload);
      
      // Update global application profile state with the new data
      setProfile(updatedData);
      
      // Navigate back to the profile display screen
      onBack();
    } catch (err) {
      setError(err.message || "An error occurred while saving changes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Edit Profile</h1>
      
      {error && <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>}

      <form onSubmit={handleSave}>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Display Name:</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", fontWeight: "bold" }}>Bio:</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={loading}
            rows={4}
            cols={40}
          />
        </div>

        <div style={{ marginTop: "20px" }}>
          <button type="submit" disabled={loading}>
            {loading ? "Saving Changes..." : "Save Changes"}
          </button>
          
          <button 
            type="button" 
            onClick={onBack} 
            disabled={loading}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
