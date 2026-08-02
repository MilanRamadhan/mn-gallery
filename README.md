# Our Story

Our Story is a mobile-first relationship journal built as a quiet, editorial archive for
stories, dates, places, quotes, and photographs. Visitors can browse a chronological journey,
open a responsive gallery and lightbox, read long-form story pages, and learn more about the
couple. A protected admin area manages stories, categories, site identity, and image uploads.

The public website works immediately with local demo content. Once Supabase is connected, the
same UI reads published content from PostgreSQL and enables the complete authenticated admin
workflow.

## Stack

- Next.js 16 App Router, React 19, and strict TypeScript
- Tailwind CSS v4 plus a custom editorial token system
- Supabase PostgreSQL, Auth, Storage, and SSR cookie sessions
- React Hook Form and Zod
- Framer Motion
- Lucide React and Sonner
- `next/image` and `next/font`
- Vinext/Sites-compatible production output

## Requirements

- Node.js 22.13 or newer
- npm
- A Supabase project for login, persistence, and real uploads

## Local installation

```bash
npm install
copy .env.example .env.local
npm run assets:placeholders
npm run dev
```

Open the local URL printed by the development server. Without Supabase variables, public pages
use the six stories in `data/demo.ts`. The admin login explains that Supabase must be connected
and protected routes remain inaccessible.

## Environment variables

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3010
```

Use the publishable key shown in current Supabase projects. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is
kept as a compatibility fallback. The current application does not need the service-role key.
If a future server-only workflow uses it, never prefix it with `NEXT_PUBLIC_` and never import it
into a Client Component.

## Supabase setup

1. Open the shared Supabase project.
2. Under Settings → Data API, add `milanora` to Exposed schemas.
3. In SQL Editor, run `supabase/migrations/202607310001_initial_schema.sql`.
4. Run `supabase/seed.sql`.
5. Confirm that Storage contains the public `milanora-media` bucket.
6. Add the project URL and publishable key to `.env.local`.
7. Restart the development server.

The migration creates:

- `milanora.admins`
- `milanora.categories`
- `milanora.stories`
- `milanora.story_images`
- `milanora.site_settings`
- indexes and updated-at triggers
- RLS read/write policies
- the Storage bucket, 10 MB limit, MIME restrictions, and Storage policies

Anonymous visitors can only read published stories and their photographs. The admin UUID is
allowlisted in `milanora.admins`; unrelated authenticated users in the shared Supabase project
cannot manage MilaNora content.

## Create the first admin

Open Supabase → Authentication → Users → Add user. Enter the private admin email and a strong
password, then mark the email as confirmed. Sign in at `/admin/login`. Detailed steps are also
available in `docs/ADMIN_SETUP.md`.

## Content workflow

### Add or edit a story

1. Sign in and open Stories.
2. Choose New Story, or edit an existing chapter.
3. Add a title, date, location, category, excerpt, and full story.
4. Choose a cover image and optional gallery photographs.
5. Add a caption and alt text to each photograph, then use the arrow buttons to reorder.
6. Save as Draft or Published and optionally mark the story as Featured.

Drafts are readable only by an authenticated admin. Published stories appear on the homepage,
journey, gallery, and story routes. The full-story textarea treats blank lines as paragraph
breaks and does not render unsafe HTML.

### Upload limits

- JPEG, PNG, WebP, and AVIF
- 10 MB maximum per file
- up to 20 additional images per story
- unique paths under `covers/` and `stories/`
- both public URL and Storage path are saved

When an edited story removes a photograph, the database update is completed before obsolete
Storage files are removed. Delete operations also report partial Storage cleanup failures.

### Categories and settings

Categories can be created or edited from `/admin/categories`. A category still referenced by a
story cannot be deleted. Site Settings controls names, relationship date, tagline, About copy,
quote, accent color, hero/couple image URLs, visibility, and SEO copy.

## Replace demo content and images

- Primary fallback identity: `config/site.ts`
- Demo stories and categories: `data/demo.ts`
- Generated local placeholders: `public/placeholders/`
- Placeholder generator: `scripts/generate-placeholders.mjs`

Change the fallback relationship date to a real ISO date such as `2024-02-14`. After Supabase is
connected, Settings becomes the primary editable identity source. Upload real photographs
through Admin; do not place private keys or sensitive files in the repository.

## Routes

Public:

- `/` — editorial homepage
- `/journey` — filterable chronological timeline
- `/gallery` — responsive gallery and accessible lightbox
- `/story/[slug]` — editorial story article
- `/about` — relationship portrait, statistics, and personal letter

Admin:

- `/admin/login`
- `/admin`
- `/admin/stories`
- `/admin/stories/new`
- `/admin/stories/[id]/edit`
- `/admin/categories`
- `/admin/settings`

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

The layout supports keyboard navigation, visible focus states, image alt text, touch-friendly
controls, one-column mobile timelines, full-screen mobile lightbox, admin drawer/bottom
navigation, and `prefers-reduced-motion`.

## Deployment

### Sites / Cloudflare

This repository includes `.openai/hosting.json` and a Vinext-compatible Worker entry. Use the
Sites deployment flow after a successful `npm run build`.

### Vercel

The application uses standard App Router conventions. Create a Vercel project from the
repository, add the same environment variables, set the production site URL, and deploy. If
your Vercel project expects the native Next build command, set its Build Command to
`next build`. Add the Vercel production URL to the Supabase Auth redirect allowlist.

## Security notes

- There is no public registration route.
- RLS is enabled on every application table.
- Anonymous users have no write policies.
- Admin authorization is checked on the server and refreshed through Next.js 16 `proxy.ts`.
- The service-role key is not sent to the browser.
- The default metadata and robots route use noindex because this is personal content. Change
  the privacy configuration only when you intentionally want search indexing.
- A public Storage bucket means anyone with a file URL can view that file. Use signed URLs and
  private Storage policies if the photographs require stronger privacy.

## Project limitations before configuration

Supabase credentials and the first admin account are external requirements and cannot be
created from source code. Until they are supplied, public pages use local demo data, uploads
remain disabled, and protected admin pages redirect to login.
