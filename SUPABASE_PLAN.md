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

## SQL Schema Draft

This is the first planned database table for JeNieCast.

```sql
create table public.watch_items (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,

  title text not null,
  type text not null,
  platform text not null,
  mood_tags text[] not null default '{}',
  status text not null,
  notes text default '',

  source text default '',
  link text default '',
  rating integer,
  is_rewatchable boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint rating_range check (
    rating is null or rating between 1 and 10
  )
);
```

## `updated_at` Trigger Draft

The `updated_at` value should change automatically whenever a watch item is updated.

```sql
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_watch_items_updated_at
before update on public.watch_items
for each row
execute function public.set_updated_at();
```

## Row Level Security Draft

Row Level Security should be enabled before app code writes to the table.

```sql
alter table public.watch_items enable row level security;
```

Users should only be able to select their own watch items.

```sql
create policy "Users can select their own watch items"
on public.watch_items
for select
to authenticated
using (
  auth.uid() = user_id
);
```

Users should only be able to insert rows for their own authenticated user id.

```sql
create policy "Users can insert their own watch items"
on public.watch_items
for insert
to authenticated
with check (
  auth.uid() = user_id
);
```

Users should only be able to update their own watch items, and the updated row must remain owned by them.

```sql
create policy "Users can update their own watch items"
on public.watch_items
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);
```

Users should only be able to delete their own watch items.

```sql
create policy "Users can delete their own watch items"
on public.watch_items
for delete
to authenticated
using (
  auth.uid() = user_id
);
```

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

The frontend should still check for a signed-in user before database actions, but ownership must be enforced by Supabase Row Level Security rather than frontend code alone.

## Vercel Environment Variables

The first Supabase version should keep the project as HTML, CSS, and JavaScript. Vercel will need public browser-safe Supabase values exposed to the frontend.

Planned environment variables:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
```

If the app uses Vite or another build tool later, these may need a public prefix such as:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

For the current plain HTML, CSS, and JavaScript setup, the implementation should avoid committing real keys directly into the repo. The exact loading approach needs to be chosen before code is added.

## First Implementation Slice

The first Supabase implementation should be intentionally small.

Scope:

1. Create the Supabase project.
2. Enable Google authentication.
3. Run the `watch_items` table SQL.
4. Run the `updated_at` trigger SQL.
5. Enable RLS and add select/insert/update/delete policies.
6. Add a Supabase client setup file to the existing HTML/CSS/JavaScript app.
7. Add basic Google login/logout UI.
8. Display the signed-in user's email or name.
9. Confirm auth sessions persist across refreshes.

Out of scope for the first slice:

- Replacing all `localStorage` reads and writes.
- Importing local data into Supabase.
- Reworking dashboard rendering.
- Adding new frontend frameworks.
- Adding server-only Supabase service-role logic.

Success criteria:

- A user can sign in with Google.
- A user can sign out.
- The app can detect whether the user is signed in.
- RLS policies are active before real watchlist writes are introduced.
- Logged-out `localStorage` behavior still works.

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
