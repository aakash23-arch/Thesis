# Supabase Setup

Manual steps to provision the database for Thesis. Supabase here is used purely as hosted
Postgres reached through Prisma -- not Supabase Auth (auth is NextAuth.js, wired in Session 2).

1. Create a Supabase project at https://supabase.com. Pick the region closest to India (e.g.
   `ap-southeast-1`). Store the database password securely.
2. **Project Settings -> Database -> Connection string**:
   - Copy the _Connection pooling_ URI (port 6543, transaction mode) into `DATABASE_URL`,
     and append `?pgbouncer=true&connection_limit=1`.
   - Copy the _Direct connection_ URI (port 5432) into `DIRECT_URL`.
3. **Project Settings -> API**:
   - `Project URL` -> `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key -> `SUPABASE_SERVICE_ROLE_KEY` (server-only secret, never shipped to
     the client)
4. Copy `.env.example` to `.env` (git-ignored) and fill in the values from steps 2-3.
5. Run `npx prisma migrate dev --name init` to create all tables from `prisma/schema.prisma`
   and generate the Prisma Client.
6. Verify the tables in the Supabase Table Editor.

## Architecture note

Thesis uses NextAuth.js with a Prisma adapter, not Supabase Auth -- the app never talks to
Postgres through the Supabase JS client with the anon key, only through Prisma's direct
connection. Because of that, Row Level Security policies are not required for this architecture
to be safe. Leave RLS at its default state; revisit only if a future session introduces
browser-side Supabase client usage.
