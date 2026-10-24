import React from "react";

const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <rect width="80" height="80" fill="#e5e7eb"/>
      <circle cx="40" cy="30" r="14" fill="#9ca3af"/>
      <path d="M12 74c4-16 16-24 28-24s24 8 28 24" fill="#9ca3af"/>
    </svg>
  `);

export default function ProfileScreen({ profile, loading, error, onEditProfile }) {
  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile found.</div>;

  return (
    <div>
      <h1>Profile (API test page)</h1>

      <img
        src={profile.avatar_url || DEFAULT_AVATAR}
        alt={profile.display_name || profile.username || "Avatar"}
        width={80}
        height={80}
        style={{ borderRadius: "50%", objectFit: "cover" }}
        onError={(e) => {
          if (e.currentTarget.src !== DEFAULT_AVATAR) {
            e.currentTarget.src = DEFAULT_AVATAR;
          }
        }}
      />

      <ul>
        <li><strong>ID:</strong> <code>{profile.id}</code></li>
        <li><strong>Display name:</strong> {profile.display_name}</li>
        <li><strong>Username:</strong> {profile.username}</li>
        <li><strong>Bio:</strong> {profile.bio || "No bio added"}</li>
        <li><strong>Avatar URL:</strong> {profile.avatar_url || "Not set"}</li>
        <li><strong>Created at:</strong> {profile.created_at}</li>
        <li><strong>Updated at:</strong> {profile.updated_at}</li>
      </ul>
      
      <button onClick={onEditProfile}>Update-data</button>

      <h2>Raw API JSON</h2>
      <pre
        style={{
          padding: "16px",
          background: "#f3f4f6",
          borderRadius: "8px",
          overflowX: "auto",
          color: "#111827",
        }}
      >
        {JSON.stringify(profile, null, 2)}
      </pre>
    </div>
  );
}
