-- Existing administrator records in public.user_roles are preserved.
-- Apply this migration only after confirming that the intended admin is already present.
DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;
DROP FUNCTION IF EXISTS public.handle_first_admin();
