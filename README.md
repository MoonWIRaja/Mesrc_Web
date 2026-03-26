# MESRC Web

<p align="center">
<strong>Landing website and local admin CMS for Melaka Eye Specialist & Refractive Centre</strong>
<br>
<img src="https://img.shields.io/badge/version-0.1.0-blue.svg" alt="Version">
<img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg" alt="Node">
<img src="https://img.shields.io/badge/next-16-black.svg" alt="Next.js">
<img src="https://img.shields.io/badge/status-private-lightgrey.svg" alt="Private Repo">
</p>

<p align="center">
Built for <strong>Melaka Eye Specialist & Refractive Centre</strong>
</p>

<p align="center">
<a href="#quick-start">Quick Start</a> |
<a href="#project-structure">Project Structure</a> |
<a href="#admin-cms">Admin CMS</a> |
<a href="#commands">Commands</a> |
<a href="#data-and-uploads">Data & Uploads</a> |
<a href="#troubleshooting">Troubleshooting</a>
</p>

---

> **This repo ships with the current website content, admin data, and uploaded assets.**

## Quick Start

### Clone project

```bash
git clone https://github.com/MoonWIRaja/Mesrc_Web.git
cd Mesrc_Web
```

### Install dependencies

```bash
npm install
```

### Setup environment

```bash
cp .env.example .env
```

Minimum required values:
- `FRONTEND_PORT=3000`
- `JWT_SECRET=replace-with-a-strong-random-secret`
- `DATABASE_URL=file:./prisma/dev.db`

### Run the website

Recommended for day-to-day work:

```bash
npm run dev --workspace web
```

Open:
- landing page: `http://localhost:3000`
- admin login: `http://localhost:3000/login/admin`

Default admin login:
- email: `admin@eyespecialist.com`
- password: `Admin123`

Change these after first use if this project will be shared or deployed.

## What This Project Includes

MESRC Web is a Turborepo monorepo centered around the `apps/web` Next.js app.

Main website sections:
- Hero
- About
- CEO Message
- Doctors
- Services
- Promotions
- Reviews
- Gallery
- Contact
- Video Showcase

Admin pages included:
- `/admin`
- `/admin/hero`
- `/admin/about`
- `/admin/ceo`
- `/admin/doctors`
- `/admin/services`
- `/admin/promotions`
- `/admin/reviews`
- `/admin/gallery`
- `/admin/contact`
- `/admin/video`
- `/admin/settings`

## Project Structure

```text
.
|-- apps/
|   |-- web/
|   |   |-- app/
|   |   |-- components/
|   |   |-- data/
|   |   |   `-- site-data.json
|   |   |-- lib/
|   |   |-- prisma/
|   |   `-- public/
|   |       `-- uploads/
|   `-- docs/
|-- packages/
|   |-- auth/
|   |-- database/
|   |-- eslint-config/
|   |-- typescript-config/
|   `-- ui/
|-- .env.example
|-- package.json
`-- turbo.json
```

Important folders:
- `apps/web/app` contains the Next.js routes, admin pages, and API routes
- `apps/web/components` contains landing page sections and admin UI pieces
- `apps/web/data/site-data.json` stores the current CMS content
- `apps/web/public/uploads` stores uploaded images used by the site
- `apps/web/lib/data` contains the default data and file-based store logic

## Admin CMS

The admin panel is local file-based.

How it works:
1. content is loaded from `apps/web/data/site-data.json`
2. if the file does not exist yet, default data is created automatically
3. admin edits update the JSON file
4. uploaded images are saved into `apps/web/public/uploads`
5. the landing page reads from the same stored data

This means:
- your current admin setup can be committed to git
- cloning the repo can bring the same content and uploaded images
- if you deploy to an environment without persistent disk writes, admin edits may not persist unless that environment supports writable storage

### Image uploads

Upload API:

```text
POST /api/upload
```

Accepted image types include:
- JPG / JPEG
- PNG
- WebP
- GIF
- SVG
- ICO
- AVIF
- BMP
- TIFF
- HEIC / HEIF

Default upload size limit:
- `50MB`

Optional env override:

```bash
UPLOAD_MAX_MB=50
```

## Environment Variables

Core ports:

```bash
FRONTEND_PORT=3000
BACKEND_PORT=3001
```

Public URLs:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

Security:

```bash
JWT_SECRET=replace-with-a-strong-random-secret
```

Database:

```bash
DATABASE_URL=file:./prisma/dev.db
DATABASE_URL_POSTGRES=postgresql://user:password@localhost:5432/mesrc_prod?schema=public
DATABASE_URL_TEST=file:./prisma/test.db
```

Optional social OAuth:

```bash
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_REDIRECT_URI=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_REDIRECT_URI=
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=
```

If you are not using social integrations yet, these can stay empty.

## Commands

### Root commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run format
npm run check-types
```

What they do:
- `npm run dev` runs workspace dev tasks through Turbo
- `npm run build` builds all configured workspaces
- `npm run start` starts the production app flow with `.env`
- `npm run lint` runs lint tasks across workspaces
- `npm run format` formats `ts`, `tsx`, and `md` files
- `npm run check-types` runs type checks across workspaces

### Web app commands

If you want to work on the website only:

```bash
npm run dev --workspace web
npm run build --workspace web
npm run start --workspace web
npm run lint --workspace web
npm run check-types --workspace web
```

## Data And Uploads

Current project content is not only in code. It also lives in committed runtime files.

Important persisted files:
- `apps/web/data/site-data.json`
- `apps/web/public/uploads/*`

If you want the latest admin changes to move with the repo:
1. make the changes from `/admin`
2. confirm `apps/web/data/site-data.json` changed
3. confirm any new files exist in `apps/web/public/uploads`
4. commit and push both

Example:

```bash
git add apps/web/data/site-data.json apps/web/public/uploads
git commit -m "chore: update MESRC site content"
git push origin main
```

## Build And Deployment Notes

Production build:

```bash
npm run build
npm run start
```

Important deployment note:
- this project currently uses local filesystem storage for CMS data and uploads
- that works well on local servers or environments with persistent writable storage
- on serverless or ephemeral filesystems, admin edits and uploads may not persist unless you add durable storage

## Troubleshooting

### Admin login fails

Check:
- you are using `http://localhost:3000/login/admin`
- `JWT_SECRET` is set in `.env`
- default credentials have not already been changed in `apps/web/data/site-data.json`

### Admin changes are not showing on landing page

Check:
- the save request completed successfully
- `apps/web/data/site-data.json` actually updated
- the related image exists in `apps/web/public/uploads`
- the browser is not showing stale cached content

### Uploaded image is missing

Check:
- the file exists inside `apps/web/public/uploads`
- the stored URL starts with `/uploads/`
- the image file was committed if you moved the project to another machine

### Lint fails across the monorepo

Use this first:

```bash
npm run check-types --workspace web
```

This is the fastest way to verify the main web app before chasing cross-workspace lint issues.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Prisma
- Turborepo
- Local JSON-based CMS storage for site content

## Repository Notes

- repo: `Mesrc_Web`
- branch: `main`
- package manager: `npm`
- minimum node version: `18+`

