DO $$ DECLARE
    r record;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
    END LOOP;
END $$;

-- ⚠️ WARNING: This script truncates ALL tables in the public schema.
-- It deletes all data and resets auto-incrementing sequences.
-- Use with caution — ensure you have a recent backup before running.
-- Not safe for production without prior review of tables and dependencies.
