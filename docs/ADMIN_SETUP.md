# Create the first admin

1. In the shared Supabase project, expose `milanora` under Settings → Data API → Exposed schemas.
2. Create the private admin under Authentication → Users and confirm the email.
3. Open SQL Editor and run `supabase/migrations/202607310001_initial_schema.sql`.
4. Run `supabase/seed.sql`.
5. Confirm that Storage contains the public `milanora-media` bucket.
6. Copy the project URL and publishable key into `.env.local`.
7. Restart the development server and sign in at `/admin/login`.

The migration is configured for admin UID `154f5164-d2e2-408d-a18b-5acb07c2a403`.
If the admin account changes, update the UID in the migration before running it.

## Managing the journal

- Open `/admin/login` and sign in with the Supabase user from step 4.
- Choose **Stories → New story** to add a title, date, location, short description,
  full story, cover photo, and additional gallery photos.
- Open an existing item under **Stories** to edit or unpublish it.
- Use **Categories** to organise memories and **Settings** to change names,
  relationship date, homepage copy, profile image, and site accent.
- Set a story to **Draft** while writing; use **Published** when it is ready for
  the public Journey and Gallery pages.

There is deliberately no public registration page. Only users listed in `milanora.admins` can
open the admin area or modify MilaNora content. Other authenticated users in the shared project
remain outside the MilaNora allowlist.

The service-role key is not required by the current app flow. If you add it later, keep it
server-only and never expose it through a NEXT_PUBLIC_ variable.
