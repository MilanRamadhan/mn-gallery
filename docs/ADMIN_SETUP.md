# Create the first admin

1. Create a Supabase project.
2. Open SQL Editor and run the initial schema file in supabase/migrations.
3. Run supabase/seed.sql.
4. Open Authentication → Users → Add user.
5. Enter the private admin email and a strong password. Mark the email as confirmed.
6. Copy the project URL and publishable key into .env.local.
7. Restart the development server and sign in at /admin/login.

There is deliberately no public registration page. Any authenticated Supabase user can manage
content under the included RLS policies, so only create accounts for trusted administrators.

The service-role key is not required by the current app flow. If you add it later, keep it
server-only and never expose it through a NEXT_PUBLIC_ variable.
