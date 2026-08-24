# Plan: Step 6 — Deployment

## Decisions
- **Hosting:** Netlify Free for the Next.js app. Chosen over Vercel Hobby because Vercel's Hobby plan ToS restricts use to non-commercial projects — this is a real business pilot, so Netlify Free is the correct free option, not just a preference.
- **Database:** Supabase Free PostgreSQL.
- **Authentication:** Clerk Free.
- **Initial URL:** Use Netlify's free `*.netlify.app` domain.
- **Custom domain:** Buy a domain later and connect it to the same Netlify deployment.
- **Cost:** ₹0/month until the custom domain is purchased.
- **Cloudflare Workers:** Not needed for V2. Keep the current Next.js setup and use Netlify for simplicity.

## V2 Deployment
- [ ] Deploy the Next.js app to Netlify Free (Netlify auto-detects Next.js via its Next.js Runtime).
- [ ] Connect the existing Supabase Free PostgreSQL database.
- [ ] Configure Clerk Free for the deployed Netlify URL.
- [ ] Use the free `*.netlify.app` URL during V2.
- [ ] Keep the complete V2 stack within the free tiers.

## Later
- [ ] Purchase a custom domain when the product is ready for launch.
- [ ] Connect the custom domain to the existing Netlify deployment.
- [ ] Reassess hosting and service costs before the commercial launch.
