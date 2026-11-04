<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Architecture and security rules

- Public news reads go through `src/lib/news.functions.ts` server functions and use the Supabase publishable key.
- Admin CRUD uses the browser Supabase client and relies on PostgreSQL RLS policies plus `has_role(admin)`; never treat a hidden route or client-side check as the security boundary.
- The admin login is invite/provisioning-only. Do not add public sign-up or self-service role assignment.
- The legacy first-signup-admin trigger must be removed with `drizzle/migrations/0003_disable_public_admin_signup.sql`; verify the intended administrator already exists in `public.user_roles` before applying it.
- Uploaded media lives in the private `media` bucket and is stored in news rows as long-lived signed URLs. Do not switch it to a public bucket without reviewing the media access model.
- Keep `.env` files out of Git. Only Supabase URL and publishable key belong in browser-visible configuration; never commit `service_role` or secret keys.
- Sanitize article HTML with `sanitizeNewsHtml` before rendering it.
