# JeNieCast

JeNieCast is a HTML, CSS, and JavaScript web app for saving movies, shows, videos, anime, documentaries, and comfort rewatches. The goal is to make it easier to keep a personal watchlist and quickly pick something that fits a mood.

## Current Features

- Save watch items with a title, type, platform, mood tags, status, and notes.
- View saved items on a dashboard.
- Filter the dashboard by mood.
- Search the dashboard by title, platform, type, status, notes, or mood.
- Sort dashboard results by recently added, title, type, status, or platform.
- Build mood filter buttons from the tags saved on watch items.
- Edit saved items.
- Delete saved items with a confirmation prompt.
- Show a random saved item as the homepage "Tonight's Genie Pick".
- Show different empty-state messages for empty watchlists, filters, and searches.
- Store data in the browser with `localStorage`.
- Seed starter items only once for first-time users.
- Repair invalid `localStorage` data back to an empty watchlist.
- Share Type and Status options between Add and Edit forms.
- Render user-entered text with safer DOM methods instead of HTML injection.

## Current Tech Stack

- HTML
- CSS
- JavaScript
- Browser `localStorage`

This project intentionally does not use React or another frontend framework yet.

## Data Storage

JeNieCast currently stores watch items in browser `localStorage` under:

```text
jeniecastItems
```

It also uses this key to avoid reloading starter/demo items after the first run:

```text
jeniecastStarterItemsLoaded
```

If stored data is corrupted or is not an array, the app repairs the watchlist back to an empty list instead of crashing.

This is good for early development, but it is not a replacement for real accounts or shared storage. A future version should move user data to a backend database with authentication.

## Future Direction

Planned improvements include:

- User accounts and login.
- Backend data storage.
- Shared or cloud-synced watchlists.
- Better recommendation logic.
- More dashboard filters.
- Optional import/export.
