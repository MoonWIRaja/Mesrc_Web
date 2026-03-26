## 2026-03-26
### Decision
- Project documentation at the repo root should describe the real MESRC setup, not the default Turborepo starter.
- Current site state should move with the repository by committing both content data and uploaded assets.
- Shared defaults should come from the current MESRC content state, centralized in `apps/web/lib/data/defaults.ts`, and reused by the store/API/admin fallbacks.
- Image editing should use a shared `Image Focus` workflow across hero, about, ceo, doctors, services, and promotions, with the same control model for position, zoom, opacity, and blur.
- When landing/admin image framing matters, use shared or near-shared preview structures instead of generic image boxes.

### Preference
- Keep changes tightly scoped to the exact user request and avoid extra UI or layout changes that were not asked for.
- Prefer direct, practical documentation and workflow notes over generic template text.
- Preserve established landing layouts when polishing admin previews or card arrangements.
- Use `npm exec --workspace apps/web -- tsc --noEmit` as the fast verification path for the main app.

### Fact
- The main web app is `apps/web`, built with Next.js inside a Turborepo monorepo.
- Admin CMS content is stored in `apps/web/data/site-data.json`.
- Uploaded media is stored in `apps/web/public/uploads`.
- Admin login route is `/login/admin`.
- Default seeded admin credentials are `admin@eyespecialist.com` / `Admin123` unless changed in stored data.
- Gallery social buttons are driven by `tiktokUrl`, `instagramUrl`, and `facebookUrl` from gallery admin settings.
- The navbar brand link returns to the hero section through `/#hero`.
- The old CEO signature field/rendering has been removed from the landing page, admin flow, and default stored data.
- The repo remote is `origin https://github.com/MoonWIRaja/Mesrc_Web.git` on branch `main`.
