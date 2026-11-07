# Running VirtualTeach

This guide covers local development, Docker Compose, and a basic Kubernetes deployment.

## Prerequisites

- Java 17 and Maven 3.9 or newer
- Node.js 22 LTS and npm
- XAMPP with its MySQL/MariaDB service enabled for local API development
- Docker Desktop with Docker Compose for the container option
- `kubectl` and a configured cluster for Kubernetes

## Option A: Run locally

### 1. Start XAMPP MariaDB

Start Apache and MySQL from the XAMPP Control Panel. In phpMyAdmin (`http://localhost/phpmyadmin`), create a database named `virtual_teaching`. The default XAMPP database address is `localhost:3306`; the default account is `root` with an empty password. If you configured a password or another port, use those values below.

### 2. Start the backend

Open PowerShell at the repository root and set the database/JWT environment values for the current terminal:

```powershell
$env:DB_HOST = "localhost"
$env:DB_PORT = "3306"
$env:DB_NAME = "virtual_teaching"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = ""
$env:JWT_SECRET = "replace-with-a-long-random-secret-at-least-32-characters"
```

Run the API:

```powershell
mvn -B -f backend/pom.xml spring-boot:run
```

The API listens on `http://localhost:8080`. Hibernate creates/updates the tables, and the app seeds sample data when the database is empty.

### 3. Start the frontend

Open a second terminal at the repository root:

```powershell
Set-Location .\frontend
npm ci
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The frontend API client defaults to `http://localhost:8080/api`.

### 4. Demo accounts

The current seeder creates these demo accounts when it seeds an empty database. The password for each account is `password123`.

| Role | Email |
|---|---|
| Tutor | `amelia@virtualteaching.com` |
| Tutor | `marcus@virtualteaching.com` |
| Tutor | `priya@virtualteaching.com` |
| Tutor | `ethan@virtualteaching.com` |
| Student | `daniel@virtualteaching.com` |
| Student | `olivia@virtualteaching.com` |

Use these credentials only for local demonstrations. Do not use them in a public deployment.

## Option B: Run with Docker Compose

1. Copy `.env.example` to `.env` in the repository root.
2. Replace the sample database password in both `MARIADB_PASSWORD` and `DB_PASSWORD` (keep them equal), set `MARIADB_ROOT_PASSWORD`, and replace `JWT_SECRET`.
3. From the repository root, run:

   ```powershell
   docker compose up --build
   ```

4. Open `http://localhost:8081`. The frontend's Nginx server forwards `/api/` requests to the API container.
5. The API is also exposed at `http://localhost:8080` for direct API testing.

Stop the application with `Ctrl+C`, then run `docker compose down`. The named MariaDB volume persists data. To remove that database data intentionally, use `docker compose down --volumes`.

## Run tests and production builds

Backend integration tests use the H2 test profile and do not require XAMPP or MariaDB:

```powershell
mvn -B -f backend/pom.xml test
```

Frontend production build:

```powershell
Set-Location .\frontend
npm ci
npm run build
```

## Option C: Deploy to Kubernetes

1. Build and publish images using the GitHub Actions workflow, or build them manually and push them to a registry.
2. Edit `k8s/virtualteach.yaml`: replace the GHCR image references and the placeholder values in the Kubernetes Secret. Do not commit real secrets.
3. If the images are private, configure an image pull secret in the namespace and reference it from both application Deployments.
4. Apply the manifest:

   ```powershell
   kubectl apply -f .\k8s\virtualteach.yaml
   ```

5. Wait for the workloads:

   ```powershell
   kubectl -n virtualteach rollout status deployment/mariadb
   kubectl -n virtualteach rollout status deployment/backend
   kubectl -n virtualteach rollout status deployment/frontend
   ```

6. Forward the frontend service to the local machine:

   ```powershell
   kubectl -n virtualteach port-forward service/frontend 8081:80
   ```

7. Open `http://localhost:8081`. The frontend Nginx container proxies API calls to the in-cluster backend service.

The included Kubernetes manifest is a demonstration baseline, not a production-hardened setup. For production, use a managed MySQL-compatible database, externally managed secrets, TLS/Ingress, backups, resource sizing, image scanning, and an appropriate persistent storage class.

## Troubleshooting

- **Backend cannot connect to XAMPP:** confirm MySQL is started in the XAMPP Control Panel, `virtual_teaching` exists, and `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, and `DB_PASSWORD` are correct.
- **Frontend cannot reach the API in local development:** start the backend and check `http://localhost:8080`; the Vite app defaults to `http://localhost:8080/api`.
- **Frontend cannot reach the API in containers:** use `docker compose logs backend frontend` and confirm the backend service is healthy enough to accept connections. Container frontend requests use the Nginx `/api/` proxy, not `localhost:8080`.
- **Port already in use:** stop the process using the port or change the host-side port mapping in `docker-compose.yml`.
- **Demo data is missing:** the seeder runs only when the database has no users. Existing databases are not reset automatically.
