# JitterDev status site

Replacement site for `jitterdev.vercel.app`. It serves no installers and contains no download links; the only page content is a status note plus a maintenance overlay.

The overlay state lives in `site/maintenance.json` and nowhere else. There is no admin page, no passcode and no API: this is a static site.

## Deploy

1. Vercel → **Add New → Project** → import `snimmagadda2-alt/jitter`.
2. **Root Directory**: `site`. Framework preset: **Other** — no build command, no output directory.
3. Project name: `jitterdededev` → the site is served at `jitterdededev.vercel.app`.

No environment variables are needed.

## Turning the overlay on and off

Edit `site/maintenance.json` in the GitHub web editor and commit to `main`:

```json
{ "enabled": true, "message": "…", "updatedAt": "…" }
```

- `enabled: true` — visitors see the maintenance card and the page cannot scroll.
- `enabled: false` — the overlay is hidden and the status panel shows **Online**.

`message` is the text shown inside the card. Vercel redeploys on the commit, so the change is live once that deploy finishes; open tabs re-check every 60s and need no reload.

## Files

- `index.html` — the only page. Fetches `/maintenance.json` on load.
- `maintenance.json` — the on/off switch and its message.
- `vercel.json` — keeps `/maintenance.json` uncached so a toggle is not hidden behind a stale copy.
