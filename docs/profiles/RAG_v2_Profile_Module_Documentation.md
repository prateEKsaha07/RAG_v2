# RAG_v2 Profile Module Documentation

## 1. Overview

The Profile module manages the signed-in user's personal profile in
RAG_v2. It currently supports:

-   Automatically creating a default profile when a new Supabase Auth
    user is created.
-   Fetching the authenticated user's profile.
-   Updating editable profile fields.
-   Displaying a default avatar when the user has not uploaded a profile
    image.
-   Keeping profile access tied to the authenticated user's identity.

The current implementation is an MVP. It does not yet include avatar
uploads, public profiles, social features, or advanced account settings.

## 2. Technology and Architecture

-   **Frontend:** React with Vite.
-   **Authentication:** Supabase Auth.
-   **Backend:** FastAPI.
-   **Database:** Supabase PostgreSQL.
-   **Frontend API calls:** `fetch()` with a Supabase access token in
    the `Authorization` header.
-   **Backend authentication:** `get_current_user`, which validates the
    bearer token with Supabase.

### Request flow

1.  A user signs up or logs in through Supabase Auth.
2.  The frontend obtains the user's active Supabase session and access
    token.
3.  The frontend calls a FastAPI profile endpoint with
    `Authorization: Bearer <access_token>`.
4.  FastAPI validates the token and identifies the current user.
5.  The backend queries or updates `public.profiles` using the
    authenticated user's UUID.
6.  The response is returned to the frontend and rendered in React.

The frontend must not choose which user's profile is fetched or updated
by sending an arbitrary user ID. The backend derives the profile ID from
the validated token.

## 3. Relevant Files

The implementation discussed for this module uses the following files.
Names may differ slightly if the project has since been reorganized.

### Backend

-   `backend/app/core/auth.py` --- validates the bearer token and
    returns the authenticated user.
-   `backend/app/core/supabase_client.py` --- creates the backend
    Supabase client.
-   `backend/app/modules/profile/router.py` --- profile API routes.
-   `backend/app/modules/profile/service.py` --- profile database
    operations, if the service layer is used.
-   `backend/app/modules/profile/schemas.py` --- request and response
    validation, if schemas are separated.
-   `backend/app/main.py` --- registers the profile router.

### Frontend

-   `frontend/src/supabaseClient.js` --- Supabase JS client used by the
    frontend.
-   `frontend/src/api/profiles.js` --- frontend functions for profile
    API requests (use the actual filename consistently).
-   `frontend/src/components/profile/ProfileScreen.jsx` --- loads and
    displays profile data.
-   `frontend/src/App.jsx` --- app navigation and screen integration.
-   `frontend/.env` --- contains `VITE_API_URL`, pointing to the FastAPI
    backend.

## 4. Database: `public.profiles`

Each profile row belongs to exactly one Supabase Auth user. The `id`
column is the user's Auth UUID.

### Expected columns

  -----------------------------------------------------------------------
  Column                  Purpose                 Default / behavior
  ----------------------- ----------------------- -----------------------
  `id`                    Primary key and link to Uses `auth.users.id`
                          the Auth user           

  `display_name`          Name displayed in the   Signup metadata, email
                          UI                      prefix, or `New User`

  `username`              App username            Generated as `user_`
                                                  plus the first eight
                                                  UUID characters without
                                                  hyphens

  `bio`                   Short profile           Empty string
                          description             

  `avatar_url`            URL of the user's       `NULL` until a custom
                          custom avatar           avatar is added

  `created_at`            Profile creation        Expected database
                          timestamp               default: `now()`

  `updated_at`            Last profile update     Expected database
                          timestamp               default: `now()`;
                                                  update behavior should
                                                  be maintained by the
                                                  backend or a database
                                                  trigger
  -----------------------------------------------------------------------

The table should have a primary key on `id`, and `id` should reference
`auth.users(id)` with deletion behavior appropriate to the project
(commonly `ON DELETE CASCADE`).

### Row Level Security (RLS)

RLS should be enabled on `public.profiles`. Owner policies can restrict
direct authenticated-client operations to rows whose `id` equals
`auth.uid()`.

The backend currently uses a service-role Supabase client according to
the project setup. A service-role key bypasses RLS. Therefore, backend
routes must enforce ownership themselves by using the authenticated
user's UUID in every profile query and update. Never accept an arbitrary
profile owner ID from the request body.

Keep the service-role key on the backend only. Never expose it through a
`VITE_` environment variable or frontend bundle.

## 5. Automatic Profile Creation at Signup

A PostgreSQL trigger on `auth.users` creates a profile row when a new
Auth user is inserted.

### Trigger behavior

The function `public.handle_new_user()`:

1.  Receives the newly inserted Auth user row.
2.  Uses `new.id` as the profile ID.
3.  Chooses `display_name` using the first non-empty value among:
    -   `raw_user_meta_data ->> 'display_name'`
    -   `raw_user_meta_data ->> 'full_name'`
    -   the part of the email address before `@`
    -   `New User`
4.  Generates a username like `user_4cc96b82` from the UUID.
5.  Sets `bio` to an empty string.
6.  Sets `avatar_url` to `NULL`.
7.  Inserts the profile row and uses `ON CONFLICT (id) DO NOTHING` to
    avoid inserting a duplicate profile for the same user.

The trigger is named `on_auth_user_created` and runs after insert on
`auth.users`.

### Signup lifecycle

1.  Supabase Auth creates the account.
2.  The PostgreSQL trigger runs as part of the database operation.
3.  A default profile row is inserted.
4.  The user logs in or receives a session according to the configured
    signup flow.
5.  The frontend calls `GET /profile/me`.
6.  The profile API returns the newly created row.

### Important notes

-   Create the trigger only once. If it already exists, inspect it
    before attempting to create another trigger with the same name.
-   The trigger only handles newly created Auth users. Existing users
    who have no profile need a one-time backfill or a backend fallback.
-   The generated username is designed to avoid collisions in normal
    use, but the database should still enforce a unique constraint on
    `username`.
-   If a username uniqueness conflict occurs during trigger execution,
    signup can fail unless the trigger handles that case. Review this
    behavior if signup begins returning database errors.
-   The `created_at` and `updated_at` columns should have database
    defaults so the trigger does not need to supply them.
-   A `NULL` `avatar_url` is intentional: the frontend chooses the
    fallback avatar when no custom avatar exists.

## 6. Authentication

The frontend sends the current Supabase access token as a bearer token:

`Authorization: Bearer <access_token>`

The backend dependency `get_current_user` validates the token with
Supabase and returns the authenticated user. Profile endpoints should
use this dependency.

### Authentication requirements

-   Missing bearer token: return HTTP `401`.
-   Invalid or expired token: return HTTP `401`.
-   Do not log full access tokens or session objects.
-   Do not trust an ID supplied by the browser to identify the profile
    owner.
-   Do not expose the Supabase service-role key to the frontend.

The frontend implementation discussed in this project reads the access
token from `localStorage` using the key `access_token`. The login flow
must continue setting that key if the API module depends on it.
Alternatively, the frontend can retrieve the current token from
`supabase.auth.getSession()`; choose one consistent approach rather than
mixing token sources.

## 7. API Endpoints

### `GET /profile/me`

**Purpose:** Return the profile belonging to the currently authenticated
user.

**Authentication:** Required.

**Process:**

1.  Validate the bearer token.
2.  Get the current user's UUID from the validated user object.
3.  Query `public.profiles` for that UUID.
4.  Return the profile data.

**Successful response:** A profile object containing fields such as
`id`, `display_name`, `username`, `bio`, `avatar_url`, `created_at`, and
`updated_at`.

Example response:

``` json
{
  "id": "4cc96b82-9420-4fe0-954a-6ade58ad9cb4",
  "display_name": "prateeksaha123",
  "username": "user_4cc96b82",
  "bio": "",
  "avatar_url": null,
  "created_at": "2026-10-24T15:48:15.694235+00:00",
  "updated_at": "2026-10-24T15:48:15.694235+00:00"
}
```

If the endpoint uses a single-row query, it should return a single
object. If an implementation returns a one-element array, the frontend
should handle that shape deliberately or the API response should be
standardized.

**Possible errors:**

-   `401` --- missing, invalid, or expired token.
-   `404` --- no profile exists for the authenticated user, unless the
    backend has a fallback that creates missing profiles.
-   `500` --- unexpected database or server failure.

Because new profiles are created by the signup trigger, a missing row
for a newly created account generally indicates that the trigger failed,
was not installed, or the account predates the trigger.

### `PATCH /profile/me`

**Purpose:** Update editable fields on the currently authenticated
user's profile.

**Authentication:** Required.

**Typical editable fields:**

-   `display_name`
-   `username` (only if username editing is supported and uniqueness is
    checked)
-   `bio`

The endpoint should reject or ignore attempts to change protected fields
such as `id`, `created_at`, and `updated_at` directly.

**Process:**

1.  Validate the bearer token.
2.  Get the authenticated user's UUID.
3.  Validate the supplied update fields.
4.  Update only the row whose `id` matches the authenticated user's
    UUID.
5.  Set `updated_at` to the current time.
6.  Return the updated profile.

Example request body:

``` json
{
  "display_name": "New Display Name",
  "bio": "Building projects in data science and full-stack development."
}
```

**Possible errors:**

-   `401` --- missing, invalid, or expired token.
-   `404` --- no profile row exists for the authenticated user.
-   `422` --- request body fails validation.
-   `409` or another documented client error --- username already
    exists, if username editing is supported.
-   `500` --- unexpected server or database failure.

The frontend should check `response.ok` rather than looking for an `ok`
property in the JSON body. Error details can be read from the response's
`detail` field when provided by FastAPI.

## 8. Frontend API Module

The frontend API module contains reusable functions rather than putting
fetch logic in every UI element.

### `getMyProfile()`

-   Sends a `GET` request to `${VITE_API_URL}/profile/me`.
-   Adds the bearer token to the request headers.
-   Checks the HTTP status.
-   Parses the JSON response.
-   Returns the profile object. If the backend returns an array, the
    current frontend implementation can unwrap the first element.

### `updateMyProfile(profileData)`

-   Sends a `PATCH` request to `${VITE_API_URL}/profile/me`.
-   Adds the bearer token.
-   Sends editable fields as JSON.
-   Checks the HTTP status and throws a useful error on failure.
-   Returns the updated profile data.

Ensure the import name and export name match exactly. For example, if
the module exports `getMyProfile`, importing `fetchMyProfile` will cause
a JavaScript module error unless that name is also exported.

### API URL

The frontend reads `VITE_API_URL` from `frontend/.env`. For local
development, it may point to the local FastAPI server. Use the actual
backend URL for the environment in which the app is running, and restart
Vite after changing environment variables.

## 9. Profile Screen

`ProfileScreen.jsx` is responsible for loading and rendering the profile
in the React UI.

### Loading states

The screen should handle these states:

-   **Loading:** show a loading message or indicator while the API
    request is pending.
-   **Error:** display a useful message if the request fails.
-   **No profile:** show a fallback message if the API returns no
    profile.
-   **Loaded:** display profile fields and available profile actions.

The component can call `getMyProfile()` from `useEffect()`, store the
result in state, and render the data once the request completes.

### Displayed fields

The current test-oriented profile screen displays:

-   Avatar
-   Profile UUID
-   Display name
-   Username
-   Bio
-   Avatar URL
-   Creation timestamp
-   Update timestamp
-   Raw JSON response for debugging

The raw JSON block is useful while developing, but can be removed from
the production-facing UI.

## 10. Default Avatar

The profile uses `avatar_url` when it has a value. If `avatar_url` is
`NULL`, the frontend displays a built-in SVG fallback.

The SVG is encoded as a `data:image/svg+xml;utf8,...` URL, so it does
not require a separate file or network request.

The SVG namespace must be:

`http://www.w3.org/2000/svg`

A typo in the namespace can prevent the SVG from rendering correctly.

An image error handler can switch to the default avatar if a custom
avatar URL fails to load. Avoid repeatedly assigning the fallback to
itself; check whether the current image is already the fallback before
changing it.

The default avatar should generally not be stored in `avatar_url`.
Keeping that column `NULL` distinguishes a default image from a
user-uploaded image.

## 11. Updating the Profile in the UI

The current profile editing workflow should:

1.  Open edit mode when the user selects **Edit Profile**.
2.  Populate form fields from the loaded profile.
3.  Allow changes to supported fields.
4.  Validate input before submission.
5.  Disable or guard the Save button while the request is in progress.
6.  Call `updateMyProfile()` with only editable fields.
7.  Display a success message on success.
8.  Update React state using the returned profile.
9.  Preserve the form values and show an error if the request fails.
10. Support cancellation without saving changes.

The backend must perform validation and ownership enforcement even when
the frontend already validates the form.

## 12. Security Considerations

-   Always validate access tokens on protected backend routes.
-   Always derive the target profile ID from the authenticated user.
-   Never accept `id` as an editable profile field.
-   Keep service-role credentials server-side.
-   Enable RLS and use owner-based policies for direct client access.
-   Remember that the backend service-role client bypasses RLS; the
    backend must still restrict every query to the authenticated user's
    UUID.
-   Do not log access tokens, passwords, or complete session secrets.
-   Validate display-name, username, and bio lengths and allowed
    formats.
-   Enforce username uniqueness in the database, not only in the
    frontend.
-   Consider rate limits and request-size limits if the profile
    endpoints become public-facing at scale.

## 13. Testing and Verification

### Signup and automatic profile creation

Create a new test account and confirm that Supabase Auth creates the
user and the database trigger inserts a corresponding row into
`public.profiles`. Verify that the profile ID matches the Auth user's
UUID, the display-name fallback is applied when signup metadata is
absent, a username is generated, `bio` is an empty string, `avatar_url`
is `NULL`, and both timestamps are populated.

### Profile retrieval

Call `GET /profile/me` with a valid access token and verify that the
response belongs to the authenticated user. Confirm that the profile
screen renders the returned fields and displays the default avatar when
`avatar_url` is `NULL`. Requests with missing or invalid tokens should
be rejected, and the endpoint should return a consistent response shape.

### Profile updates

Update the display name and bio, then confirm that the changes persist
after refreshing the page and signing in again. If username editing is
enabled, verify that duplicate usernames are rejected. Confirm that
`updated_at` changes after a successful update and that a user cannot
update another user's profile.

### Regression and error handling

Verify that login, logout, dashboard navigation, and profile navigation
continue to work. Confirm that loading and API error states are handled
clearly. Remove the raw JSON debug output from the production-facing UI,
unless it is intentionally retained for development. Existing accounts
without a profile should be handled through a backfill or a documented
fallback.

## 14. Known Limitations and Future Work

The current MVP does not necessarily include the following:

-   Avatar upload and deletion through Supabase Storage.
-   Username availability checking before saving.
-   A profile backfill for accounts created before the trigger.
-   A backend fallback that creates a missing profile on first fetch.
-   Email changes or password management.
-   Public profile pages or social features.
-   Profile completeness indicators.

These can be implemented separately without changing the basic ownership
model of the profile module.

## 15. Summary

The Profile module uses Supabase Auth to identify users, PostgreSQL to
store their profile information, FastAPI to expose authenticated profile
endpoints, and React to fetch and display the data.

New users receive a default profile through a database trigger.
`GET /profile/me` retrieves the current user's profile,
`PATCH /profile/me` updates supported fields, and the frontend shows a
default avatar when no custom avatar URL exists. The backend must always
enforce ownership using the validated user's UUID.
