# Ahem Corporation — Construction & Engineering Website

Full-stack corporate website, tender/procurement portal, lead-management (CRM) system and admin dashboard.

- **Public site:** Home, About, Services (+14 detail pages), Projects (+detail), Tenders (+detail), Inquiry hub, Clients & Partners, Certifications & Compliance, Careers (+detail, CV upload), News (+detail), Contact, Privacy / Cookies / Data handling / Terms, Brand.
- **Admin:** `/admin` — 20 modules, role-based access, audit log.

## Technology

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript (strict) |
| Styling | Tailwind CSS v4, self-hosted Plus Jakarta Sans + Inter (`@fontsource-variable`) |
| Motion / 3D | Framer Motion (reveals, counters, parallax, tilt, page transitions), Three.js (hero structure, lazy-loaded, desktop only), Lenis (smooth scrolling), CSS 3D (delivery stack) |
| Database | PostgreSQL via **Drizzle ORM** (`src/db/schema.ts`, SQL migrations in `drizzle/`) |
| Auth | Custom sessions: scrypt password hashes, hashed session tokens, httpOnly cookies |
| Email | Nodemailer over SMTP, every attempt logged |
| PDF | pdf-lib (corporate profile, tender notices) |

> The brief suggested Prisma and GSAP. This project runs on the hosting template's Drizzle ORM (same PostgreSQL schema concepts, typed queries, SQL migrations), and Framer Motion + Lenis cover the scroll animation needs without adding GSAP.

## Quick start

```bash
cp .env.example .env          # set DATABASE_URL (and the other values for production)
npm install
npx drizzle-kit push          # create/update the schema  (or: npx drizzle-kit migrate)
npm run build && npm run start
```

On first start the app initialises itself (`src/lib/bootstrap.ts`):

1. if the schema is missing it applies the migrations in `drizzle/`;
2. if the database is empty it creates the first Super Admin and the sample content (`src/lib/seed.ts`, `src/lib/seed-data.ts`).

Both steps are idempotent and guarded by a PostgreSQL advisory lock.

### First sign-in

| | |
| --- | --- |
| URL | `/admin` |
| Email | `ADMIN_EMAIL` or `admin@ahemcorporation.com` |
| Password | `ADMIN_PASSWORD` or `Ahem@Admin2026` |

When the default password is used, the dashboard shows a persistent warning until it is changed (Admin → My account). **Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before the first production start.**

## Sample content

Seeded projects, tenders, clients, certification placeholders, vacancies, news, testimonials and leads are flagged `is_sample`:

- labelled **Sample** on the public site and in the admin;
- excluded from structured data (no sample job postings/articles are sent to search engines);
- removable per module or all at once from **Dashboard → Sample content**.

Contact details, statistics, history and leadership are sample settings — edit them in **Website settings** and untick the "sample" boxes. No registration numbers, certificates or government approvals are invented: the Certifications page lists placeholder categories until genuine documents are uploaded.

WhatsApp buttons, the Google Map and social links appear automatically once their values are entered in **Website settings → Contact details / Social media**.

## Admin modules

Dashboard & analytics · Website pages · Projects · Services · Tender management · Tender invitations · Project inquiries · Leads & CRM · Clients & partners · Certifications & documents · Job openings / applications · News & blog · Media library · Testimonials · Contact submissions · Email notifications (+ email log) · SEO · Users & roles · Website settings · Audit log.

Every list supports search, filters, sorting, pagination and **CSV export** (UTF-8 with BOM — opens in Excel).

### Roles

| Role | Access |
| --- | --- |
| Super Admin | Everything, including users and data export |
| Administrator | Everything except user management and data export |
| Tender Manager | Tender management, **tender invitations only**, media |
| Project Manager | Projects, project requirements / quotations / proposals, media |
| Content Editor | Projects, services, news, clients, testimonials, pages, media |
| HR Manager | Job openings, applications (CV downloads), media |

The matrix lives in `src/lib/site.ts` (`PERMISSIONS`, `leadTypesForRole`) and is enforced server-side in every page (`requireUser`) and API handler (`apiUser`, `resourceFor`).

## Lead management

Public forms (`src/lib/forms.ts` drives both the UI and server validation): tender invitation, project requirement, quotation, proposal, company-profile request, meeting, business inquiry, contact.

Each submission: validated → attachments checked and stored → unique reference (`AHM-TI-YYMMDD-XXXXX`) → saved → in-app notification → admin email → confirmation email → visible in the dashboard with status and activity history.
Statuses: New, Under Review, Contacted, Quotation Submitted, Negotiation, Won, Lost.

**Public vs confidential:** `tenders` are public announcements. Tender *invitations* are `leads`: never rendered on the public site, visible only to the tender desk and administrators, attachments downloadable only when signed in (downloads are audited).

## Security

- Passwords: scrypt (N=16384) with per-user salt. Sessions: 256-bit random token, only its SHA-256 is stored; httpOnly cookie, `Secure` over HTTPS, `SameSite=Lax`, 7-day expiry; password change / deactivation revokes sessions.
- CSRF: all mutating endpoints require a custom `x-ahem-csrf` header (cannot be sent cross-site without CORS, which is never enabled) and reject requests the browser labels cross-site (`Sec-Fetch-Site`).
- Authorisation is checked on the server for every request, including row-level scoping of leads by role.
- Rate limiting (PostgreSQL-backed, works across instances): sign-in, forms, uploads, PDF generation, analytics.
- Uploads: extension allow-list per purpose, size limits, content-signature check, server-assigned MIME type, `nosniff`, random 128-bit IDs. SVG/HTML uploads are not accepted.
- Input: every field is validated/normalised on the server; text is rendered through React (no raw HTML injection); URLs are restricted to http(s) and site-relative paths.
- Audit log: sign-ins (including failures), create/update/delete/publish, exports, private file downloads.
- Headers: `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS; set `FRAME_ANCESTORS='self'` in production.
- Client IPs come from `X-Forwarded-For` — run behind a reverse proxy you control so the header can be trusted.

## Files

Uploads are stored in PostgreSQL (`files` + `file_blobs`), so they survive redeploys and are included in database backups. `src/lib/storage.ts` isolates byte storage in `putObject` / `getObject`; point those at an S3-compatible bucket if you prefer object storage.

## Email

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`. Choose recipients and toggles in **Website settings → Email notifications**. Without SMTP the site keeps working and each message is recorded in **Email log** as "Not configured" — the success screen then tells the visitor to keep the reference number instead of promising an email.

## SEO

Unique titles/descriptions and canonical URLs per page, Open Graph/Twitter cards, generated OG image, `sitemap.xml`, `robots.txt`, Organization (`GeneralContractor`) / Service / JobPosting / NewsArticle JSON-LD. Google Analytics ID and Search Console verification are set in the admin; The cookie notice appears only when a Google Analytics ID is configured (the built-in visit counter is cookie-less), and Analytics loads only after the visitor accepts.

## Backups

```bash
# full, restorable backup (content, leads, uploads)
pg_dump --format=custom "$DATABASE_URL" > ahem-$(date +%F).dump
pg_restore --clean --if-exists -d "$DATABASE_URL" ahem-YYYY-MM-DD.dump
```

Schedule this daily (cron or your provider's managed backups). **Settings → Data & system** additionally offers a JSON data export for Super Admins.

## Deployment

1. Provision PostgreSQL and a Node.js 20+ host.
2. Set the variables from `.env.example` (if `NEXT_PUBLIC_SITE_URL` is omitted, canonical URLs and the sitemap fall back to the host of each request — set it explicitly in production)
   — (`DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, SMTP, `FRAME_ANCESTORS='self'`).
3. `npm ci && npx drizzle-kit migrate && npm run build && npm run start` behind an HTTPS reverse proxy that forwards `X-Forwarded-Proto` and `X-Forwarded-For`.
4. Sign in, change the password, then work through **Dashboard → Go-live checklist**.

Schema changes: edit `src/db/schema.ts`, run `npx drizzle-kit generate`, commit the new file in `drizzle/`, then `npx drizzle-kit migrate` on deploy.

## Publishing to GitHub

This working copy is already a git repository (`main` branch, first commit made). `.env`,
`node_modules`, `.next` and build caches are ignored, so no credentials are committed.

**With the GitHub CLI (easiest):**

```bash
gh auth login
gh repo create ahem-corporation-website --private --source=. --remote=origin --push
```

**Without the CLI** — create a token with repository-creation rights, then:

```bash
GH_TOKEN=github_pat_xxx ./scripts/publish-to-github.sh ahem-corporation-website private
```

The helper creates the repository through the GitHub API, sets `origin` and pushes `main`
without ever writing the token to `.git/config`. Use `public` instead of `private` for a
public repository.

After pushing, add the environment variables from `.env.example` in **Settings → Secrets
and variables** of the new repository (or in your hosting provider) — never to the code.
Consider enabling branch protection and Dependabot alerts on the new repository.

## Project structure

```
src/app/(site)/        public pages          src/app/admin/        admin dashboard
src/app/api/           public + admin API    src/components/       UI (site + admin)
src/db/schema.ts       database schema       src/lib/              auth, security, storage, email, pdf, seed, settings
drizzle/               SQL migrations        public/brand/         logo files (SVG)
```
