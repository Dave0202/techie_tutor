# VirtualTeach

VirtualTeach is a full-stack virtual tutoring MVP that connects students with tutors. Students can discover tutors by subject, view profiles, request sessions, track bookings, and browse study resources. Tutors can manage their profile and sessions and share resource links.

## Features

- Student and tutor registration/login with JWT-based authentication
- Role-aware student and tutor dashboards
- Tutor directory with subject search and profile details
- Student session booking and session status tracking
- Tutor session management
- Learning resource listing and tutor resource-link publishing
- XAMPP MariaDB/MySQL persistence and seeded demonstration accounts
- Responsive React interface
- Docker Compose setup and Kubernetes baseline manifests
- GitHub Actions tests/builds and GHCR image publishing

## Technology

| Area | Stack |
|---|---|
| Frontend | React, JavaScript, Vite, React Router, Axios, Lucide React |
| Backend | Java 17, Spring Boot 3, Spring Web, Spring Data JPA, Spring Security, JWT, Lombok |
| Database | XAMPP MariaDB (MySQL-compatible) |
| Backend tests | Spring Boot Test, MockMvc, H2 |
| Delivery | Docker, Docker Compose, GitHub Actions, Kubernetes |

## Repository layout

```text
.
├── backend/                 # Spring Boot REST API
├── frontend/                # React + Vite single-page application
├── k8s/                     # Kubernetes baseline deployment
├── .github/workflows/       # CI and container publishing
├── docker-compose.yml       # Local multi-container environment
├── BUILD_WORKFLOW.md        # Step-by-step project build workflow
└── RUNNING.md               # Local, Docker, and Kubernetes run instructions
```

## Quick start with Docker

Prerequisite: Docker Desktop with Docker Compose.

```powershell
Copy-Item .env.example .env
```

Edit `.env`, set `MARIADB_PASSWORD` and `DB_PASSWORD` to the same strong local password, set `MARIADB_ROOT_PASSWORD`, and replace `JWT_SECRET`. Start the services from the repository root:

```powershell
docker compose up --build
```

Open [http://localhost:8081](http://localhost:8081). The API is available at [http://localhost:8080](http://localhost:8080); browser API requests are routed through the frontend Nginx container.

To stop the services, press `Ctrl+C` and run `docker compose down`. MariaDB data is stored in a named volume and remains after containers stop.

## Local development

Requirements: Java 17, Maven 3.9+, Node.js 22 LTS, npm, and XAMPP with MySQL/MariaDB enabled.

1. Start Apache and MySQL in the XAMPP Control Panel.
2. In phpMyAdmin (`http://localhost/phpmyadmin`), create a database named `virtual_teaching`.
3. Set the backend variables in PowerShell. The XAMPP defaults are shown; if you changed the database credentials or port, use your configured values:

   ```powershell
   $env:DB_HOST = "localhost"
   $env:DB_PORT = "3306"
   $env:DB_NAME = "virtual_teaching"
   $env:DB_USERNAME = "root"
   $env:DB_PASSWORD = ""
   $env:JWT_SECRET = "replace-with-a-long-random-secret-at-least-32-characters"
   ```

4. Start the backend from the repository root:

   ```powershell
   mvn -B -f backend/pom.xml spring-boot:run
   ```

5. In another terminal:

   ```powershell
   Set-Location .\frontend
   npm ci
   npm run dev
   ```

6. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

The frontend defaults to the API URL `http://localhost:8080/api`. Set `VITE_API_URL` before building if a different API base URL is required.

Profile pictures are uploaded directly to Cloudinary using the `mrnfxyxs` cloud and the `virtual-tutor` unsigned upload preset. The preset must be configured as unsigned in Cloudinary and restricted to image uploads. The frontend defaults can be overridden at build time with `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET`; when changing the cloud, also set backend `CLOUDINARY_CLOUD_NAME` so the API only accepts image URLs from the configured Cloudinary account. The backend stores the resulting secure Cloudinary URL on the signed-in user's profile.

The backend permits the standard Vite development origin (`localhost:5173` or `127.0.0.1:5173`) and preview origins on ports `4173` and `4174`. For another frontend host or port, set `CORS_ALLOWED_ORIGINS` to a comma-separated list of exact origins (for example, `https://tutor.example.com,https://www.tutor.example.com`) before starting the backend. Do not use wildcard origins with credentials enabled.

## Demo accounts

When the database is empty, the backend seeds demonstration users with password `password123`:

| Role | Email |
|---|---|
| Tutor | `amelia@virtualteaching.com` |
| Tutor | `marcus@virtualteaching.com` |
| Tutor | `priya@virtualteaching.com` |
| Tutor | `ethan@virtualteaching.com` |
| Student | `daniel@virtualteaching.com` |
| Student | `olivia@virtualteaching.com` |

These are local demo credentials only. Change/remove them and use strong credentials before any public deployment.

## API overview

The API base path is `/api`.

| Method | Path | Purpose | Access |
|---|---|---|---|
| `POST` | `/auth/register` | Register student or tutor | Public |
| `POST` | `/auth/login` | Authenticate and return JWT | Public |
| `PUT` | `/users/me/profile-picture` | Save the signed-in user's Cloudinary profile-picture URL | Authenticated |
| `GET` | `/tutors` | List tutors; optional `subject` query | Public |
| `GET` | `/tutors/{id}` | Get tutor profile | Public |
| `PUT` | `/tutors/profile` | Create/update authenticated tutor profile | Authenticated tutor |
| `POST` | `/sessions/book` | Book a tutor session with an optional subject and 30/60/90-minute duration (defaults to general tutoring, 60 minutes) | Authenticated student |
| `GET` | `/sessions/my-sessions` | List current user's sessions | Authenticated |
| `PATCH` | `/sessions/{id}/status?status=CONFIRMED` | Update session status | Authenticated participant |
| `GET` | `/resources` | List resources | Public |
| `POST` | `/resources/upload` | Publish a resource link | Authenticated tutor |

The frontend booking summary estimates the session total from the tutor's hourly rate and selected duration. Booking requests do not collect payment.

Protected requests use `Authorization: Bearer <JWT>`. Booking statuses are `PENDING`, `CONFIRMED`, `COMPLETED`, and `CANCELLED`.

## Tests and build

Backend integration tests run against H2:

```powershell
mvn -B -f backend/pom.xml test
```

Frontend production build:

```powershell
Set-Location .\frontend
npm ci
npm run build
```

GitHub Actions runs these checks for pull requests and pushes. Pushes to `main` and version tags also build and publish backend/frontend images to GHCR.

## Configuration

Backend configuration is supplied through environment variables:

| Variable | Default | Description |
|---|---|---|
| `DB_HOST` | `localhost` | MySQL/MariaDB host (XAMPP locally) |
| `DB_PORT` | `3306` | MySQL/MariaDB port |
| `DB_NAME` | `virtual_teaching` | Database name |
| `DB_USERNAME` | `root` | Database user (XAMPP default) |
| `DB_PASSWORD` | Empty | Database password (XAMPP default); set if configured |
| `JWT_SECRET` | Development fallback in application properties | JWT signing secret; always override outside local demos |
| `JWT_EXPIRATION` | `86400000` | JWT validity in milliseconds |

Do not use the development fallback or sample `.env` values in a public or production deployment. Keep `.env` out of Git and use a secret manager or Kubernetes Secret for deployments.

## Deployment and project workflow

- [RUNNING.md](./RUNNING.md) explains local, Docker Compose, and Kubernetes setup.
- [BUILD_WORKFLOW.md](./BUILD_WORKFLOW.md) documents the step-by-step build workflow.
- [docker-compose.yml](./docker-compose.yml) starts MariaDB, the API, and frontend.
- [k8s/virtualteach.yaml](./k8s/virtualteach.yaml) is the Kubernetes starting point.
- [.github/workflows/ci-cd.yml](./.github/workflows/ci-cd.yml) runs checks and publishes container images.

The Kubernetes files are an educational baseline. Production operation requires additional infrastructure and security work, including managed database backups, TLS, ingress, secret management, monitoring, and capacity planning.
