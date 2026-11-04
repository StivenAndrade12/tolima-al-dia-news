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

## Architecture rules

- Public news reads go through `src/lib/news.functions.ts` server functions (publishable client) so pages SSR with SEO; admin CRUD uses the browser client and relies on RLS `has_role(admin)`.
- The first account that signs up becomes admin (DB trigger); later accounts get no write access unless granted in `user_roles`.
- Uploaded media lives in the private `media` bucket and is stored in news rows as long-lived signed URLs, because public buckets are blocked in this workspace.
