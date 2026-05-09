# JeNieCast Supabase Plan

## Goal

Move JeNieCast from a single-browser `localStorage` app to a real account-based web app using Supabase authentication and database storage.
The first database version should keep the existing frontend features while allowing each signed-in user to save and access their own watchlist across devices.

## Authentication Plan

JeNieCast will start with Google login only.

Reasons:

- Simple sign-in experience.
- No password reset flow needed.
- Good fit for a portfolio project.
- Supabase handles the authentication session.

Future authentication options may include email/password or magic link, but those are not part of the first Supabase version.

## Data Ownership

Each saved watch item will belong to one authenticated user.

The `watch_items` table will include a `user_id` column connected to the Supabase authenticated user.

Users should only be able to view, create, edit, and delete their own watch items.

## Main Table

### `watch_items`

| Column | Type | Purpose |
|---|---|---|
| `id` | uuid | Unique item id |
| `user_id` | uuid | Owner of the watch item |
| `title` | text | Movie, show, video, or saved idea title |
| `type` | text | Movie, Series, YouTube, Anime, Documentary, Unknown, etc. |
| `platform` | text | Netflix, YouTube, TikTok, Prime Video, etc. |
| `mood_tags` | text[] | Saved mood tags such as Eating, Funny, Comfort |
| `status` | text | Want to Watch, Watching, Finished, Rewatchable, Saved Idea |
| `notes` | text | User notes |
| `source` | text | Where the user discovered it |
| `link` | text | Optional link |
| `rating` | integer | Optional user rating |
| `is_rewatchable` | boolean | Whether the item belongs in the rewatch vault |
| `created_at` | timestamptz | When the item was created |
| `updated_at` | timestamptz | When the item was last updated |

## Migration Behavior

JeNieCast currently stores data in `localStorage`.

When a user logs in for the first time:

1. The app checks whether `localStorage` has watch items.
2. If local items exist, the app shows an option to import them into the user's account.
3. The app should not automatically import local data without the user choosing to do so.
4. During import, duplicate title/platform combinations should be skipped.
5. After import, the database becomes the main source of truth for logged-in users.

## Logged-Out Behavior

Logged-out users can still use the app with `localStorage`.

This keeps JeNieCast usable as a demo without requiring login immediately.

## Logged-In Behavior

Logged-in users will use Supabase as the main data source.

Their watchlist should load from the database and stay connected to their account.

## Security Plan

Row Level Security will be enabled on the `watch_items` table.

Users can only:

- Select their own watch items.
- Insert watch items using their own `user_id`.
- Update their own watch items.
- Delete their own watch items.

## Implementation Steps

1. Create a Supabase project.
2. Enable Google authentication.
3. Create the `watch_items` table.
4. Enable Row Level Security.
5. Add RLS policies.
6. Add Supabase client file to the project.
7. Add login/logout UI.
8. Load database items for signed-in users.
9. Keep `localStorage` mode for logged-out users.
10. Add localStorage-to-Supabase import option.
11. Test all existing features after database integration.
12. Deploy updated app to Vercel.
13. Add Supabase environment variables to Vercel.
14. Update README with new database/auth features.