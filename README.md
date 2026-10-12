# JHERICON LLC — Version 11, working server-side inquiry forms

The Contact and Training pages now POST to a Cloudflare Worker endpoint (`/api/inquiry`) instead of opening a mail application. The Worker uses Resend to send the inquiry to **pjreed5@jhericon.com**, which Cloudflare Email Routing forwards to the verified Yahoo inbox.

## IMPORTANT: Setup required before form delivery works
1. Create a Resend account at https://resend.com/ and add a sending domain, preferably `notify.jhericon.com`, following Resend's DNS verification instructions in Cloudflare. This is **separate from** the existing Cloudflare Email Routing MX records for `jhericon.com`; do not replace those MX records. Resend may require plan approval or payment depending on usage.
2. In Resend, create an API key and keep it private.
3. In Cloudflare Dashboard > Compute > Workers & Pages > **jhericonllc** > Settings > Variables and Secrets, create encrypted secret `RESEND_API_KEY` with that key. Set environment variable `FORM_FROM_EMAIL` to `JHERICON Website <forms@notify.jhericon.com>` (the sending domain must be verified by Resend).
4. Replace the repository contents with this project structure (root: `wrangler.jsonc`, `src/index.js`, `public/*.html`, `public/styles.css`, `public/script.js`, `public/assets/*`). Do not retain duplicate root HTML files as a second source of truth.
5. In the Cloudflare build/deploy configuration for this existing Workers project, make sure deployment uses `npx wrangler deploy` from repository root. The `wrangler.jsonc` now defines the Worker and static assets; no build command is needed.
6. Deploy and test both `/contact.html` and `/training.html`. If email sending fails, forms show an explicit error. No fake success message is displayed for a failed delivery.

## Safety / behavior
- User contact information is sent over HTTPS to the Worker and then to Resend for delivery. Read Resend's data handling terms and add a privacy notice before public launch.
- The submitted form is not stored in a database; it is delivered by email. Cloudflare Email Routing forwards the resulting message to Yahoo.
- Basic form validation, a honeypot, origin check, and safe HTML escaping are included. For a public launch, add Cloudflare Turnstile and/or rate limiting to guard against abusive submissions; a honeypot alone is insufficient.
- All secrets stay in Cloudflare (never commit API keys to GitHub).
- This is *training interest*, not confirmed course enrollment.
- The existing business address and NAICS information are unchanged from the source package.
