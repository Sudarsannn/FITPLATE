# Hosting the web build (free)

Cloudflare Workers static assets, project `fitplate`, configured by `wrangler.jsonc`.

- Production branch: `claude/project-thread-wchnlm`
- Build command: `npx expo export -p web`
- Deploy command: `npx wrangler deploy`
- Build variables: `NODE_VERSION=22` and the Firebase/Google `EXPO_PUBLIC_*` values (set in the Cloudflare dashboard, never in the repo).
- Add the live address to Firebase Authentication > Settings > Authorised domains so Google sign-in works.
