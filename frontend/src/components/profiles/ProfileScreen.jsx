// frontend/src/components/profile/ProfileScreen.jsx
const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
      <rect width="80" height="80" fill="#e5e7eb"/>
      <circle cx="40" cy="30" r="14" fill="#9ca3af"/>
      <path d="M12 74c4-16 16-24 28-24s24 8 28 24" fill="#9ca3af"/>
    </svg>`
  );

export default function ProfileScreen({ profile, loading, error }) {
  if (loading) return <div>Loading profile…</div>;
  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>No profile found.</div>;

  return (
    <div>
      <h1>Profile (test page)</h1>

      <div>
        <img
          src={profile.avatar_url || DEFAULT_AVATAR}
          alt={profile.display_name || profile.username || 'avatar'}
          width={80}
          height={80}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
          onError={(e) => {
            if (e.currentTarget.src !== DEFAULT_AVATAR) {
              e.currentTarget.src = DEFAULT_AVATAR;
            }
          }}
        />
      </div>

      <ul>
        <li><strong>id (uuid):</strong> <code>{profile.id}</code></li>
        <li><strong>display_name:</strong> {profile.display_name}</li>
        <li><strong>username:</strong> {profile.username}</li>
        <li><strong>bio:</strong> {profile.bio}</li>
        <li><strong>avatar_url:</strong> {profile.avatar_url}</li>
        <li><strong>created_at:</strong> {profile.created_at}</li>
        <li><strong>updated_at:</strong> {profile.updated_at}</li>
      </ul>

      <h2>Raw JSON</h2>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </div>
  );
}