# Muhammad Naurez Khan — Portfolio

Native Next.js portfolio prepared for Vercel.

## Deploy on Vercel

1. Import `naurez-khan/portfolio-website` and keep the detected Next.js preset.
2. In **Storage**, create and connect a **public Vercel Blob** store. Vercel supplies `BLOB_READ_WRITE_TOKEN`; this enables persistent project editing and image uploads.
3. In **Settings → Environment Variables**, add:
   - `ADMIN_PASSWORD`: a unique password of at least 16 characters.
   - `RESEND_API_KEY`: the Resend server API key.
   - `CONTACT_TO_EMAIL`: the address that should receive portfolio messages.
   - `CONTACT_FROM_EMAIL`: a sender address verified in Resend.
4. Redeploy after adding or changing environment variables.

The public site works without these variables, using the built-in projects. `/admin.html` remains unavailable until `ADMIN_PASSWORD` is configured, and project changes require the connected Blob store.

## Local development

Copy `.env.example` to `.env.local`, fill in local values, then run:

```bash
npm install
npm run dev
```
