# JitterDev status site

Replacement site for `jitterdev.vercel.app`. It serves no installers and contains no download links; the only page content is a status note plus a maintenance overlay that can be switched on and off.

## Deploy

1. Vercel → **Add New → Project** → import `snimmagadda2-alt/jitter`.
2. **Root Directory**: `site`. Framework preset: **Other** — no build command, no output directory.
3. Project name: `jitterdededev` → the site is served at `jitterdededev.vercel.app`.
4. Add environment variables (Production and Preview):
   - `GITHUB_TOKEN` — fine-grained token for this repository with **Contents: Read and write**.
   - `ADMIN_PASSCODE` — the passcode the status console asks for.
5. Redeploy once after adding the variables so the function picks them up.

## Turning the overlay on and off

Open `/admin.html`, enter the passcode, flip the switch. The function commits `site/maintenance.json`, so every visitor sees the change within a minute (open tabs re-check every 60s, new loads get it immediately).

Without the environment variables the console reports the missing variable, and `index.html` falls back to whatever is committed in `site/maintenance.json`.
