# JeNieCast

JeNieCast is an account-based web app for saving movies, shows, videos, anime, documentaries, and comfort rewatches. It uses Google sign-in with Supabase Auth so each user can keep a personal watchlist connected to their own account.

Deployed app: `https://jeniecast.vercel.app`

## Current State

The public landing page leads users to Google sign-in through Supabase Auth, while Dashboard, Movie Vault, and Add Watch are protected pages for signed-in users only.

Saved items are stored in the Supabase `watch_items` table and tied to each user through `user_id`, with Row Level Security enforcing ownership. Users can add, edit, delete, search, filter, sort, export, and import their saved watch items.

The Dashboard works as an overview page with stats, Genie’s Current Pick, quick actions, and a Recently Added preview. The Movie Vault holds the full saved collection, keeping the dashboard cleaner and reducing scrolling.

The old anonymous `localStorage` starter flow has been removed, so new browsers no longer receive fake sample movies or fake Genie picks.

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
