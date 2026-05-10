# JeNieCast

JeNieCast is an account-based web app for saving movies, shows, videos, anime, documentaries, and comfort rewatches. It uses Google sign-in with Supabase Auth so each user can keep a personal watchlist connected to their own account.

Deployed app: `https://jeniecast.vercel.app`

## Current State

- Public landing page with one main Get Started sign-in action.
- Google sign-in through Supabase Auth.
- Protected Dashboard, Movie Vault, and Add Watch pages.
- Logged-out users are redirected back to the landing page from protected pages.
- Protected pages show a brief "Checking your account..." loading state before rendering account content.
- Save watch items with a title, type, platform, mood tags, status, and notes.
- Store signed-in user watch items in the Supabase `watch_items` table.
- Use the authenticated Supabase user id as `user_id` so Row Level Security can enforce ownership.
- Use the dashboard as an overview page with stats, Genie’s Current Pick, quick actions, and a Recently Added preview.
- Use the Movie Vault page to browse the full saved collection.
- See counts for total saved items and key statuses.
- Show Genie’s Current Pick on the dashboard using only the signed-in user’s saved Supabase items.
- Add a new watch item from the dashboard quick actions or the Add Watch page.
- Redirect to the Movie Vault after saving a new watch item.
- Filter the Movie Vault by saved mood tags, including new tags typed by the user.
- Search the Movie Vault by title, platform, type, status, notes, or mood.
- Clear Movie Vault search without resetting the active mood filter or sort option.
- Reset Movie Vault view back to all items, no search, and recently added sort.
- Sort Movie Vault results by recently added, title, type, status, or platform.
- Edit saved items in Supabase.
- Delete saved items from Supabase with a confirmation prompt.
- Prevent duplicate saved items with the same title and platform.
- Export the signed-in user’s current watchlist as JSON.
- Import a JeNieCast JSON backup to replace the signed-in user’s current watchlist.
- Show inline success and error messages for backup actions.
- Render user-entered text with DOM methods instead of HTML injection.

## Tech Stack

- HTML
- CSS
- JavaScript
- Vite
- Supabase Auth
- Supabase Database
- Vercel

## Data Storage

JeNieCast now uses Supabase as the normal app data source.

The main table is:

```text
public.watch_items
```

Each row belongs to a signed-in user through:

```text
user_id
```

Supabase Row Level Security should allow authenticated users to select, insert, update, and delete only their own rows.

The previous anonymous `localStorage` starter flow has been removed from the active app. New browsers should not receive fake starter data such as sample movies or sample Genie picks.

## Local Development

Install dependencies:

```bash
npm install
```

Run the app locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Future Direction

Planned improvements include:
- More fields such as source link, rating, and rewatchable flags.
- Better recommendation logic for Genie’s Current Pick.
- More dashboard filters.
- Better loading and error states.
- Additional signed-in pages if the app grows.
