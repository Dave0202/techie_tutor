# Render Backend and Vercel Frontend Deployment Workflow

This guide deploys the Spring Boot backend to Render and the React/Vite frontend to Vercel.

## 1. Prepare a production database

The backend is configured for the Aiven MySQL service using TLS. In the Aiven service's **Connection information**, use:

| Setting | Value |
|---|---|
| `DB_HOST` | `mysql-virtual-tutor-wisdoma81-7d32.c.aivencloud.com` |
| `DB_PORT` | `22303` |
| `DB_NAME` | `defaultdb` |
| `DB_USERNAME` | `avnadmin` |
| `DB_PASSWORD` | Set the current Aiven password as a secret in Render |

The JDBC URL enforces TLS with `sslMode=REQUIRED`. Do not put the database password or service URI in this repository.

## 3. Deploy the backend to Render

1. Sign in to Render and select **New → Web Service**.
2. Connect the GitHub repository `Dave0202/techie_tutor` and select the `main` branch.
3. Select **Docker** as the runtime.
4. Set **Root Directory** to `backend` so Render uses the Dockerfile in that directory.
5. Add the following environment variables in the Render service settings:

   | Variable | Value |
   |---|---|
   | `DB_HOST` | `mysql-virtual-tutor-wisdoma81-7d32.c.aivencloud.com` |
   | `DB_PORT` | `22303` |
   | `DB_NAME` | `defaultdb` |
   | `DB_USERNAME` | `avnadmin` |
   | `DB_PASSWORD` | Current Aiven password (enter as a secret; do not commit it) |
   | `JWT_SECRET` | Strong, unique random secret of at least 32 characters |
   | `CORS_ALLOWED_ORIGINS` | Your Vercel site origin, e.g. `https://your-app.vercel.app` |
   | `CLOUDINARY_CLOUD_NAME` | `mrnfxyxs` |

   If using a custom frontend domain, include its origin too. Separate origins with commas and do not include trailing slashes.

6. Create the service and wait for the Docker build and deployment to complete.
7. Copy the backend URL, for example `https://your-api.onrender.com`.
8. Check the API at `https://your-api.onrender.com/api/tutors`.

## 4. Deploy the frontend to Vercel

1. In Vercel, select **Add New → Project** and import `Dave0202/techie_tutor`.
2. Set **Root Directory** to `frontend`.
3. Use the Vite build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add these environment variables:

   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://your-api.onrender.com/api` |
   | `VITE_CLOUDINARY_CLOUD_NAME` | `mrnfxyxs` |
   | `VITE_CLOUDINARY_UPLOAD_PRESET` | `virtual-tutor` |

   The Cloudinary preset must allow unsigned image uploads. Never put a Cloudinary API secret in frontend environment variables.

5. Deploy the project and note the Vercel URL.
6. If you use a custom domain, add its exact origin to the Render `CORS_ALLOWED_ORIGINS` variable and redeploy the backend. The production origin `https://techietutor.vercel.app` is also allowed by the backend.

## 5. Verify the deployment

- Register an account and sign in; confirm the frontend can reach the Render API.
- Upload a profile picture, refresh the page, and confirm the picture remains visible. Profile picture URLs are stored in the database.
- If the browser reports a CORS error, verify that `CORS_ALLOWED_ORIGINS` exactly matches the Vercel origin, without a trailing slash, then redeploy the backend.
- The frontend includes a Vercel rewrite so nested routes such as `/profile` serve the React application on refresh.

## Notes

- Profile pictures upload directly to Cloudinary.
- Other files stored by the backend on its local filesystem may not survive a Render redeploy. Use persistent storage or cloud storage if those files must persist.
- Keep database credentials and JWT secrets in Render's environment settings. Do not commit production secrets to the repository.
