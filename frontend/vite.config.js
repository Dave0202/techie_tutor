import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const apiUrl = process.env.VITE_API_URL?.trim();
if (process.env.VERCEL === '1'
    && apiUrl
    && /^https?:\/\/(localhost|127(?:\.\d{1,3}){3})(?::|\/|$)/i.test(apiUrl)) {
  throw new Error('VITE_API_URL must point to the deployed API, not localhost, in a Vercel build.');
}

export default defineConfig({
  plugins: [react(), tailwindcss()]
});
