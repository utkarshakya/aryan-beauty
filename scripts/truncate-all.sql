DO $$ DECLARE
    r record;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'prisma_migrations') LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
    END LOOP;
END $$;

-- ⚠️ WARNING: This script truncates ALL tables in the public schema,
-- except prisma_migrations (migration history must survive).
-- It deletes all data and resets auto-incrementing sequences.
-- Prefer `npm run db:truncate`, which wraps the same idea with a
-- target banner and a confirmation prompt.
