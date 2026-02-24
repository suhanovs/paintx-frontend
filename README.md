# paintx-frontend

Next.js 16 (App Router, SSG/ISR) frontend for **[www.paintx.art](https://www.paintx.art)** — the English-language PaintX art gallery.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Icons | `@iconify/react` |
| Rendering | SSG + ISR (revalidate: 3600s) |
| Backend API | FastAPI @ `localhost:8000` (see [paintx-functions](https://github.com/suhanovs/paintx-functions)) |

## Infrastructure (Production)

- **VPS:** AWS Lightsail — `172.26.7.48` (ubuntu)
- **Process manager:** systemd — service `paintx-frontend`
- **Port:** 3000 (nginx reverse-proxies `www.paintx.art → localhost:3000`)
- **Repo on VPS:** `/home/ubuntu/paintx-frontend`
- **Node version:** 22 LTS

## Deploy

SSH into the VPS and run:

```bash
cd /home/ubuntu/paintx-frontend
git pull
npm run build
sudo systemctl restart paintx-frontend
```

> **Important:** After a deploy that follows DB data changes (e.g. translated fields, price updates), also clear the Next.js fetch cache — see [Maintenance](#maintenance) below.

## Environment

The service reads from `/etc/systemd/system/paintx-frontend.service`:

```
NODE_ENV=production
PORT=3000
INTERNAL_API_URL=http://localhost:8000
```

No `.env` file is needed in the repo directory; environment is injected by systemd.

## Service Management

```bash
# Status
sudo systemctl status paintx-frontend

# Start / Stop / Restart
sudo systemctl start paintx-frontend
sudo systemctl stop paintx-frontend
sudo systemctl restart paintx-frontend

# Logs (live)
sudo journalctl -u paintx-frontend -f

# Logs (last 100 lines)
sudo journalctl -u paintx-frontend -n 100
```

## Maintenance

### After DB data changes (artist names, translations, prices, etc.)

Next.js caches API fetch responses on disk with a 1-hour TTL. If the DB is updated and the change must appear immediately, clear the cache and restart:

```bash
rm -rf /home/ubuntu/paintx-frontend/.next/cache/fetch-cache/*
sudo systemctl restart paintx-frontend
```

> **Why this is needed:** ISR/fetch caching persists the API response for `revalidate` seconds (3600s by default). A simple `npm run build` does NOT invalidate existing cache entries. Deleting the cache dir forces a fresh fetch on the next request.

### Full clean rebuild

If something looks off after a deploy, do a full clean rebuild:

```bash
cd /home/ubuntu/paintx-frontend
git pull
rm -rf .next
npm run build
sudo systemctl restart paintx-frontend
```

### Nginx reload (after config changes)

```bash
sudo nginx -t          # test config
sudo systemctl reload nginx
```

Nginx config: `/etc/nginx/sites-available/paintx`

## API Routes (Next.js internal proxies)

These Next.js API routes proxy requests from the browser to the FastAPI backend (avoids CORS):

| Route | Proxies to |
|-------|-----------|
| `GET /api/paintings` | `http://localhost:8000/api/paintings` |
| `GET /api/paintings/[id]` | `http://localhost:8000/api/paintings/{id}` |
| `GET /api/paintings/[id]/related/[type]` | `http://localhost:8000/api/paintings/{id}/related/{type}` |

## Pages

| Route | Type | Description |
|-------|------|-------------|
| `/` | SSG + ISR | Gallery grid (first 12 paintings) — infinite scroll loads more client-side |
| `/art/[id]` | Dynamic SSR | Painting detail — title, image, artist bio, related works |

## Images

Images are served from **CloudFront** (`images.paintx.art`) backed by S3 bucket `paintx-images` (us-east-1, private, OAC-locked).

| Tier | Path |
|------|------|
| Thumbnail | `/thumb/<filename>` |
| Mid-res | `/mid/<filename>` |
| Full-res | `/img/<filename>` |
