# Running the Swiggy server off the Mac

`server/fitplate-server.mjs` can run on any always-on Node host (Render, Fly.io, Railway, a small VPS) so live Swiggy works from your phone without your Mac. It talks only to Swiggy's official MCP servers (the same ones as before).

## Server settings (environment variables)

| Variable | Purpose |
|---|---|
| `HOST=0.0.0.0` | Listen on the network. The server refuses to start in this mode without the next line. |
| `FITPLATE_ACCESS_KEY` | Long random secret. Every `/api/swiggy/*` request must send it as `X-FitPlate-Key`. Without it anyone could use your Swiggy login. |
| `FITPLATE_ALLOWED_ORIGINS` | Comma-separated website addresses allowed to call it (localhost is always allowed). |
| `FITPLATE_TOKEN_FILE` | Path on a disk that survives restarts, e.g. `/data/swiggy`. Keeps the Swiggy login (written with owner-only permissions). Unset = login lives in memory and is lost on restart. |
| `CHECKOUT_LIVE=true` | Only if you want real orders. Off by default. |

Start: `node server/fitplate-server.mjs` (needs `npm install` first).

## App settings (your phone build only, in `.env`)

```
EXPO_PUBLIC_FITPLATE_API_URL=https://your-server.example
EXPO_PUBLIC_FITPLATE_API_KEY=the same long secret
```

Anything `EXPO_PUBLIC_` ships inside the app, so do not set the key on the public website build.

## Connecting Swiggy from the phone

Profile, Shopping & vendors, turn on "Use real Swiggy", tap Connect. Swiggy's sign-in opens; log in with your phone number and OTP. Swiggy then sends the browser to `http://localhost…/callback?code=…`, which will not load on a phone. Copy that page's whole address, paste it into FitPlate and tap "Finish connecting".

## Limits

- Swiggy accepts only localhost return addresses until FitPlate is approved, which is why the address is pasted. Once Swiggy registers a real return address for FitPlate, this step can go.
- Untested against live Swiggy from the build environment (it cannot reach mcp.swiggy.com).
- Single user: one Swiggy login is shared by everyone holding the key.
