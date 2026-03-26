## 2026-03-26
### Decision
- Project documentation at the repo root should describe the real MESRC setup, not the default Turborepo starter.
- Current site state should move with the repository by committing both content data and uploaded assets.

### Preference
- Keep changes tightly scoped to the exact user request and avoid extra UI or layout changes that were not asked for.
- Prefer direct, practical documentation and workflow notes over generic template text.

### Fact
- The main web app is `apps/web`, built with Next.js inside a Turborepo monorepo.
- Admin CMS content is stored in `apps/web/data/site-data.json`.
- Uploaded media is stored in `apps/web/public/uploads`.
- Admin login route is `/login/admin`.
- Default seeded admin credentials are `admin@eyespecialist.com` / `Admin123` unless changed in stored data.
