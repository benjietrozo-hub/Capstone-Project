# Railway Deployment Guide — role-based-OIMS

## Architecture Overview

Your project has **three deployable services** on Railway:

| Service | Stack | Folder | Port |
|---|---|---|---|
| **Backend** | Laravel 11 + PHP-FPM + Nginx | `backend/` | 8080 |
| **Frontend** | React + Vite + Nginx | `frontend/` | 8080 |
| **WebSocket** | PHP WebSocket server | `websocket/` | 8080 |

Railway also provides **managed plugins** — use MySQL and Redis instead of managing your own databases.

---

## Step 1: Prepare Your Repository

### 1.1 File placement

Copy each file from this package to the correct location in your repo:

```
role-based-OIMS/
├── backend/
│   ├── Dockerfile                  ← backend.Dockerfile
│   └── docker/
│       ├── nginx.conf              ← backend-nginx.conf
│       ├── supervisord.conf        ← supervisord.conf
│       └── php.ini                 ← php.ini
├── frontend/
│   ├── Dockerfile                  ← frontend.Dockerfile
│   └── docker/
│       └── nginx.conf              ← frontend-nginx.conf
└── websocket/
    └── Dockerfile                  ← websocket.Dockerfile
```

### 1.2 Add .dockerignore files

```
backend/.dockerignore               ← backend.dockerignore
frontend/.dockerignore              ← frontend.dockerignore
```

### 1.3 Add a health check route (if missing)

In `backend/routes/api.php`, add:

```php
Route::get('/health', fn() => response()->json(['status' => 'ok']));
```

### 1.4 Fix CORS for production

In `backend/config/cors.php`, make sure `allowed_origins` reads from env:

```php
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
```

### 1.5 Ensure storage symlink works in Docker

Add this to your backend `Dockerfile` after the source copy step (already included):

```dockerfile
RUN php artisan storage:link
```

---

## Step 2: GitHub Repository

1. Commit everything to GitHub (public or private repo).
2. Make sure `.env` is in `.gitignore` — **never commit real secrets**.
3. Your `backend/.env.example` should list all required keys (no values).

---

## Step 3: Railway Project Setup

### 3.1 Create a Railway project

1. Go to [railway.app](https://railway.app) → **New Project**.
2. Choose **Deploy from GitHub repo** → select your repository.
3. Railway will detect the root — you'll add services manually per subfolder.

### 3.2 Add the MySQL Plugin

Inside your project → **New** → **Database** → **MySQL**.

Railway auto-injects these variables into services you link:
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`

### 3.3 Add the Redis Plugin

**New** → **Database** → **Redis**.

Auto-injects: `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`

---

## Step 4: Deploy the Backend Service

1. **New Service** → **GitHub Repo** → select your repo.
2. Under **Settings → Build**:
   - **Watch Paths**: `backend/**`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Build Context**: `backend`
3. Under **Settings → Deploy**:
   - **Start Command**: `/usr/bin/supervisord -c /etc/supervisord.conf`
   - **Health Check Path**: `/api/health`
4. Under **Variables**, paste all keys from `backend.env.railway`:
   - `APP_KEY` → generate with `php artisan key:generate --show` locally
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - Link MySQL and Redis plugin variables using Railway's reference syntax:
     - `DB_HOST` → `${{MySQL.MYSQL_HOST}}`
     - `REDIS_HOST` → `${{Redis.REDIS_HOST}}`
     - (etc. — see `backend.env.railway` for the full list)
5. **Generate a Railway domain** (Settings → Networking → Generate Domain).
   Note this URL — you'll need it for the frontend's `VITE_API_URL`.

### 4.1 Run migrations after first deploy

Use Railway's **Railway CLI** or the in-app shell:

```bash
# In Railway shell for the backend service:
php artisan migrate --force
php artisan db:seed --class=DatabaseSeeder  # optional
```

---

## Step 5: Deploy the Frontend Service

1. **New Service** → **GitHub Repo** → same repo.
2. Under **Settings → Build**:
   - **Watch Paths**: `frontend/**`
   - **Dockerfile Path**: `frontend/Dockerfile`
   - **Build Context**: `frontend`
3. Under **Variables**:
   ```
   VITE_API_URL=https://<your-backend-domain>.up.railway.app
   VITE_WS_URL=wss://<your-websocket-domain>.up.railway.app
   ```
   > ⚠️ Vite bakes these into the JS bundle at build time. Changing them requires a redeploy.
4. **Generate a Railway domain** for the frontend service.
5. Go back to the **backend service** and set:
   ```
   FRONTEND_URL=https://<your-frontend-domain>.up.railway.app
   SANCTUM_STATEFUL_DOMAINS=<your-frontend-domain>.up.railway.app
   ```

---

## Step 6: Deploy the WebSocket Service

1. **New Service** → same repo.
2. Under **Settings → Build**:
   - **Watch Paths**: `websocket/**`
   - **Dockerfile Path**: `websocket/Dockerfile`
   - **Build Context**: `websocket`
3. Under **Variables**:
   ```
   WEBSOCKET_PORT=8080
   DB_HOST=${{MySQL.MYSQL_HOST}}
   DB_DATABASE=${{MySQL.MYSQL_DATABASE}}
   DB_USERNAME=${{MySQL.MYSQL_USER}}
   DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
   ```
4. **Generate a Railway domain** for the WebSocket service.
5. Update the **backend** and **frontend** with the WebSocket URL.

---

## Step 7: Auto-Deploy on Push

Railway auto-deploys when you push to your connected branch (default: `main`).

To deploy only specific services on changes:
- Set **Watch Paths** per service (as done above).
- This way pushing frontend changes won't redeploy the backend.

---

## Step 8: Post-Deployment Checklist

- [ ] `https://<backend>/api/health` returns `{"status":"ok"}`
- [ ] Login works (Admin + Teacher roles)
- [ ] Inventory CRUD operations work
- [ ] Distribution requests work
- [ ] Email notifications send (check SMTP settings)
- [ ] WebSocket connection shows as connected in UI (`WebSocketStatus` component)
- [ ] File uploads (profile pictures, category images) persist to storage
- [ ] Laravel Telescope (if enabled) accessible at `/telescope`

---

## Common Issues & Fixes

### "419 CSRF token mismatch"
Set `SESSION_DOMAIN` and `SANCTUM_STATEFUL_DOMAINS` to match the frontend domain exactly (no trailing slash, no `https://`).

### Images/uploads not persisting
Railway's filesystem is ephemeral. Move file storage to an S3-compatible service:
```
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_DEFAULT_REGION=...
AWS_BUCKET=...
AWS_URL=...
```
Update `config/filesystems.php` accordingly.

### WebSocket connection refused
Railway uses reverse proxies. Your WebSocket server must:
- Listen on `0.0.0.0` (not `127.0.0.1`)
- Use port `8080` (Railway's public port maps to 8080 internally)
- Frontend should connect via `wss://` (not `ws://`) since Railway terminates TLS

### Queue jobs not running
The `supervisord.conf` includes a queue worker. Check its logs in Railway's log viewer. If jobs fail, check `QUEUE_CONNECTION=redis` is set and Redis is reachable.

### "php artisan config:cache" fails during build
This happens if env vars aren't available at build time. Move the cache commands to the `CMD` entrypoint script instead:

```dockerfile
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh
CMD ["/start.sh"]
```

```bash
#!/bin/sh
# docker/start.sh
php artisan config:cache
php artisan route:cache
php artisan view:cache
/usr/bin/supervisord -c /etc/supervisord.conf
```

---

## Estimated Railway Costs (Hobby Plan)

| Resource | Usage |
|---|---|
| Backend service | ~$5–10/month |
| Frontend service | ~$3–5/month |
| WebSocket service | ~$3–5/month |
| MySQL plugin | ~$5/month |
| Redis plugin | ~$3/month |
| **Total estimate** | **~$19–28/month** |

The Hobby plan ($5/month credit) reduces this. Starter plan (free) is available but has sleep mode.
