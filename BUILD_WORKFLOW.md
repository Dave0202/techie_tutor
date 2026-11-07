# Project Build Workflow

This document describes the end-to-end process used to design, implement, and verify the Virtual Teaching MVP. It follows the current repository architecture and can also be used as a repeatable development checklist.

## 1. Define the MVP

Start with the two roles and their primary journeys:

- Students register, find tutors by subject, view a tutor profile, request a session, track booking status, and browse learning resources.
- Tutors register, maintain a tutor profile, manage session requests, and publish learning resource links.

Keep the first version focused on those journeys rather than adding unrelated marketplace features.

## 2. Choose and verify the stack

- Frontend: JavaScript, React, Vite, React Router, Axios, and Lucide React.
- Backend: Java 17, Spring Boot 3, Spring Web, Spring Data JPA, Spring Security, validation, Lombok, and JWT.
- Database: XAMPP MariaDB/MySQL for local development and deployment; H2 for automated backend tests.

Install a Java 17 JDK, Maven, and a supported Node.js LTS release. Confirm `java -version`, `mvn -version`, and `node --version` before building.

## 3. Establish the repository structure

Keep the API and browser app separate:

```text
backend/
  src/main/java/com/virtualteaching/
    config/ controller/ dto/ exception/ model/
    repository/ security/ service/
  src/main/resources/
  src/test/
frontend/
  src/
    components/ context/ layouts/ pages/ services/
```

This keeps persistence, HTTP concerns, business rules, and UI features in distinct places.

## 4. Model the domain

Implement the core entities and relationships before writing endpoints:

1. `User` stores identity, email, password hash, and role (`STUDENT` or `TUTOR`).
2. `TutorProfile` stores tutor bio, subjects, and hourly rate.
3. `Session` relates a student to a tutor and stores schedule and status.
4. `Resource` relates a tutor to a title, description, URL, and creation time.

Use request/response DTOs at the API boundary rather than exposing JPA entities directly.

## 5. Implement persistence and seed data

Add Spring Data repositories for users, tutor profiles, sessions, and resources. Configure XAMPP MariaDB/MySQL through environment-driven settings and let JPA maintain the local schema. Keep the SQL schema resource aligned with MySQL syntax.

Seed a small, deterministic demonstration dataset only when the database is empty. Include sample tutors, students, sessions, and learning resources so tutor search and dashboards have content after startup.

## 6. Build the backend service and API layers

Implement business rules in services and keep controllers focused on HTTP mapping:

1. Authentication service registers users with BCrypt password hashes and issues JWTs.
2. Tutor service searches by subject, returns tutor profiles, and allows a tutor to update their own profile.
3. Session service creates student bookings, lists sessions for the authenticated user, and updates permitted statuses.
4. Resource service lists learning resources and allows tutors to publish resource links.
5. Controllers expose the `/api/auth`, `/api/tutors`, `/api/sessions`, and `/api/resources` endpoints.
6. Validation and centralized exception handling return useful API errors.

Configure stateless Spring Security, public access only for intended discovery/auth endpoints, and JWT authentication for protected routes.

## 7. Validate backend behavior

Use the `test` Spring profile with an in-memory H2 database. Exercise registration and login, authenticated tutor profile updates, tutor search, student booking, tutor session status changes, and resource publishing through the integration test.

Run from the repository root:

```powershell
mvn -B -f backend/pom.xml test
```

Resolve test or compilation failures before continuing to frontend integration.

## 8. Create the frontend foundation

Set up Vite and React, then create the app entry point, router, shared layout, navigation, API client, authentication context, and global styles. Keep authentication state and JWT persistence in the shared context; keep API calls in feature pages/services rather than duplicating request configuration.

The API client uses `VITE_API_URL` when supplied. Local Vite development defaults to `http://localhost:8080/api`; the container image uses the same-origin `/api` reverse proxy.

## 9. Implement the user journeys

Build pages in the order users encounter them:

1. Landing page and public tutor directory.
2. Registration and login for both roles.
3. Tutor profile details and student session booking.
4. Role-specific student and tutor dashboards.
5. Session lists and tutor status controls.
6. Shared resource browsing and tutor resource-link publishing.

Use reusable cards, status labels, loading states, empty states, and responsive layouts to keep the experience consistent.

## 10. Integrate frontend and backend

Check each page against the API routes and DTO fields. Verify that protected requests include the JWT and that public tutor/resource discovery can load without signing in. Keep local CORS origins aligned with the Vite development URL.

## 11. Package the application

Build the API as a Java 17 runtime image and the browser app as static Vite assets served by Nginx. Nginx serves the SPA fallback and proxies `/api/` to the backend service. Docker Compose runs the frontend, API, and MariaDB together.

Keep credentials out of image layers and source control. Supply local container values through an untracked `.env` created from `.env.example`; supply deployment values through Kubernetes Secrets.

## 12. Automate checks and image publishing

The GitHub Actions workflow runs backend tests and the frontend production build on pull requests and pushes. On pushes to the main branch and version tags, it builds and publishes the backend and frontend images to GitHub Container Registry (GHCR).

For publishing, enable package write permission for the workflow and ensure the repository can publish GHCR packages.

## 13. Deploy to Kubernetes

Apply the namespace, Secret, MariaDB PVC/Deployment/Service, backend Deployment/Service, and frontend Deployment/Service in `k8s/virtualteach.yaml`. Replace the image references and secret placeholders before applying. Expose the frontend service using `kubectl port-forward` or an ingress/load balancer configured for the cluster.

## 14. Final verification

Before a demonstration or release:

1. Run backend tests and frontend production build.
2. Start the app with Docker Compose and wait for the API and database startup.
3. Register a student and tutor, then exercise tutor discovery, booking, session management, and resource access.
4. Confirm containers use the expected database and that credentials are not committed.
5. Test the interface at desktop and mobile widths.

See [RUNNING.md](./RUNNING.md) for the exact local, Docker, and Kubernetes commands.
