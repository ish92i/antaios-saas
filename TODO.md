# TODO

## Clerk Webhook — Org Deletion Cascade

1. Set the webhook secret:
   ```sh
   npx convex env set CLERK_WEBHOOK_SECRET whsec_...
   ```

2. Set the Clerk secret key (for user cleanup):
   ```sh
   npx convex env set CLERK_SECRET_KEY sk_live_...
   ```

3. Configure in Clerk Dashboard → Webhooks → Add Endpoint:
   - URL: `https://[PROJECT].convex.site/webhooks/clerk`
   - Events: `organization.deleted`
   - Use the signing secret from there in step 1

4. Verify: delete a test org in Clerk, check Convex logs

## Infrastructure

- [ ] **Sentry** — Error monitoring (currently only console.error + PostHog events).
- [ ] **Automated tests** — Zero. No unit, integration, or E2E tests anywhere in the repo.
- [ ] **Security headers** — No CSP, HSTS, X-Frame-Options. Relies on Convex/Netlify defaults.
- [ ] **File size validation (server-side)** — Only client-side 10MB check on uploads. No server-side enforcement.
- [ ] **Admin dashboard** — Simple password-protected panel (password: `Abcdefg1234@@@@@`) to manage users, orgs, subscriptions, view data.

## Legal — Mentions Légales

Fill in these blanks in `src/routes/legal/notices.tsx`:

- [ ] **RCS / SIRET number** (register at formalites.entreprises.gouv.fr if not done)
- [ ] **VAT number (TVA intracommunautaire)** — if you exceed €36,800 B2C / €36,800 B2B annual revenue

## Legal — Status Summary

| Document | Route | Status |
|----------|-------|--------|
| Terms of Service | `/legal/terms` | ✅ Done |
| Privacy Policy | `/legal/privacy` | ✅ Done |
| Terms of Sale | `/legal/terms-of-sale` | ✅ Done |
| Data Processing Addendum | `/legal/dpa` | ✅ Done |
| Legal Notices (Mentions Légales) | `/legal/notices` | ✅ Drafted, needs 2 fields |
| Cookie Consent Banner | — | 🚫 Not needed (no analytics/tracking cookies) |
