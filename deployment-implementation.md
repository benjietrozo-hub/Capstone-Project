# Railway Deployment Implementation Plan

## 1. Executive Summary
This document outlines the comprehensive strategy for deploying the Web-Based Property Inventory Management System (OIMS) to the Railway.app platform. The system consists of a Laravel backend, a React frontend, a relational database (MySQL), and a WebSocket connection for real-time features. This plan ensures all services are dockerized, environment variables are correctly mapped, and deployment is seamless without any immediate code changes.

## 2. Architecture Overview
For Railway deployment, the architecture will be divided into the following isolated services:
- **MySQL Database Service**: Managed database provided by Railway.
- **Backend Service (Laravel)**: Handles API requests, scheduled jobs, and business logic.
- **Frontend Service (React/Vite)**: Serves the compiled static frontend application.
- **WebSocket Service**: (If detached) Handles real-time notifications for the system.

## 3. Pre-requisites
- **Railway Account**: Active Railway.app account (Developer or Pro tier recommended for persistent databases).
- **GitHub Repository**: Complete codebase pushed to a GitHub repository connected to Railway.
- **Railway CLI (Optional)**: Installed locally for easier debugging and environment management.

---

## 4. Implementation Phases

### Phase 1: Containerization Strategy (Docker)
Since Railway uses Nixpacks by default but allows custom Dockerfiles for greater control, we will implement Dockerfiles for both services.
*   **Backend Dockerfile**: Needs PHP 8.x, Composer, Nginx/Apache, and required PHP extensions (pdo_mysql, mbstring, etc.). It must also handle `php artisan optimize`, migration runs, and serving the application.
*   **Frontend Dockerfile**: Needs Node.js to build the Vite project (`npm run build`) and a lightweight web server (like Nginx) to serve the static files from `/dist`.

### Phase 2: Railway Environment Setup
*   **Provision Database**: Add a MySQL database plugin in the Railway project. Railway will generate credentials (`MYSQL_URL`, `MYSQL_USER`, `MYSQL_PASSWORD`, etc.).
*   **Set up Backend Service**: Link to the GitHub repo and point the root directory to `/backend`.
    *   Map database variables to Laravel's `.env` equivalents (e.g., `DB_HOST=${{MySQL.MYSQL_HOST}}`).
    *   Set `APP_ENV=production` and `APP_DEBUG=false`.
    *   Generate and set `APP_KEY`.
*   **Set up Frontend Service**: Link to the GitHub repo and point the root directory to `/frontend`.
    *   Set build arguments, specifically the backend API URL (e.g., `VITE_API_BASE_URL`).

### Phase 3: Deployment Execution
*   Deploy the **MySQL Database** first to ensure it is ready.
*   Deploy the **Backend Service**. Monitor the build logs to ensure Composer installs dependencies correctly and migrations are executed.
*   Deploy the **Frontend Service**. Monitor the Vite build process. Ensure the static assets are successfully built and served.
*   *Note: Railway assigns public domains (`.up.railway.app`) to web services. These must be cross-referenced (e.g., Backend CORS must allow Frontend domain; Frontend must point to Backend domain).*

### Phase 4: Post-Deployment Configuration
*   **CORS Configuration**: Update `config/cors.php` in the backend to allow the frontend's generated Railway domain.
*   **File Storage**: If the app uses local storage (`public/storage`), consider the ephemeral nature of Railway's file system. Files uploaded locally may be lost on redeploys unless an external bucket (like AWS S3 or Cloudflare R2) is configured.
*   **WebSocket Setup**: Ensure the WebSocket port is exposed or properly routed if it runs on the same backend service.

---

## 5. Deployment Checklist

### Preparation
- [ ] Create Railway account and link GitHub repository.
- [ ] Ensure the project is fully committed and pushed to the main branch.

### Database Setup
- [ ] Create a new Railway Project.
- [ ] Add the MySQL Database plugin.
- [ ] Take note of the generated database credentials (Host, Port, User, Password, DB Name).

### Backend Deployment (Laravel)
- [ ] Create `backend/Dockerfile` and `backend/.dockerignore` (Not yet executed).
- [ ] Create `backend/railway.json` for custom build/start commands if necessary.
- [ ] Add a new service in Railway pointing to the `/backend` directory.
- [ ] Set Backend Environment Variables:
  - [ ] `APP_NAME`, `APP_ENV=production`, `APP_KEY`, `APP_DEBUG=false`, `APP_URL`
  - [ ] `DB_CONNECTION=mysql`
  - [ ] `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` (Mapped from Railway MySQL)
  - [ ] `FRONTEND_URL` (To be filled after frontend is deployed)
- [ ] Verify successful build and deployment.
- [ ] Verify database migrations ran successfully (`php artisan migrate --force`).

### Frontend Deployment (React)
- [ ] Create `frontend/Dockerfile` and `frontend/.dockerignore` (Not yet executed).
- [ ] Add a new service in Railway pointing to the `/frontend` directory.
- [ ] Set Frontend Environment Variables:
  - [ ] `VITE_API_BASE_URL` (Set to the Backend Service's public Railway URL)
  - [ ] `VITE_WEBSOCKET_URL` (Set to the Backend/WebSocket Service's URL)
- [ ] Generate Railway domain for the frontend.
- [ ] Verify successful build and deployment.

### Final Integration & Testing
- [ ] Update Backend `CORS_ALLOWED_ORIGINS` to include the Frontend Railway domain.
- [ ] Test User Authentication (Login/Register).
- [ ] Test Database interactions (CRUD operations on Inventory).
- [ ] Test Real-time WebSocket features (Notifications).
- [ ] Test File Uploads (Verify ephemeral storage behavior or configure S3).
