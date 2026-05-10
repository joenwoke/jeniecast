# JeNieCast

JeNieCast is an account-based HTML, CSS, and JavaScript web app for saving movies, shows, videos, anime, documentaries, and comfort rewatches. It uses Google sign-in with Supabase Auth so each user can keep a personal watchlist connected to their own account.

Deployed app: `https://jeniecast.vercel.app`

## Current Features

- Public landing page with one main Get Started sign-in action.
- Google sign-in through Supabase Auth.
- Protected Dashboard and Add Watch pages.
- Logged-out users are redirected back to the landing page from protected pages.
- Protected pages show a brief "Checking your account..." loading state before rendering account content.
- Save watch items with a title, type, platform, mood tags, status, and notes.
- Store signed-in user watch items in the Supabase `watch_items` table.
- Use the authenticated Supabase user id as `user_id` so Row Level Security can enforce ownership.
- View saved items on a dashboard.
- See dashboard counts for total saved items, visible results, and key statuses.
- Show Genie’s Current Pick on the dashboard using only the signed-in user’s saved Supabase items.
- Add a new watch item from a dashboard action panel or the Add Watch page.
- Filter the dashboard by saved mood tags, including new tags typed by the user.
- Search by title, platform, type, status, notes, or mood.
- Clear dashboard search without resetting the active mood filter or sort option.
- Reset dashboard view back to all items, no search, and recently added sort.
- Sort dashboard results by recently added, title, type, status, or platform.
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

This project intentionally stays in HTML, CSS, and JavaScript. It does not use React.

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

## Environment Variables

The Vite frontend expects these environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

For Vercel, add both variables in the project settings before deploying.

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

- LocalStorage-to-Supabase migration/import for older users who saved data before accounts.
- More fields such as source link, rating, and rewatchable flags.
- Better recommendation logic for Genie’s Current Pick.
- More dashboard filters.
- Better loading and error states.
- Additional signed-in pages if the app grows.
