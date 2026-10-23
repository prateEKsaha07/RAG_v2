// frontend/src/api/profiles.js
// DUMMY implementation — replace the fetch call with your real endpoint later.

import { supabase } from "../supabaseClient";

/**
 * Fetch the current signed-in user's profile row.
 * Returns the profile object, or null if not signed in / not found.
 */
export async function fetchMyProfile() {
  // Real implementation would be:
  //
  //   const res = await fetch("/api/profiles/me");
  //   if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  //   return res.json();
  //
  // For now we return a fake row so the UI can be built/tested.
  // Optionally pull the real auth user so the id/email line up:

  const { data: { session } } = await supabase.auth.getSession();
  const authUser = session?.user;

  if (!authUser) return null;

  // simulate network latency so loading states are visible
  await new Promise((r) => setTimeout(r, 300));

  return {
    id: authUser.id,                          // uuid, matches profiles.id
    display_name: "Test User",
    username: authUser.email?.split("@")[0] || "testuser",
    bio: "Dummy bio — replace fetchMyProfile with a real API call.",
    avatar_url: null,                         // null → placeholder shown
    created_at: new Date(Date.now() - 86_400_000).toISOString(),
    updated_at: new Date().toISOString(),
  };
}