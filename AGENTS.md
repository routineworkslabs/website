# Website conventions

- This folder is the static company website for Routine Works Labs, the brand of Routine Works LTD. Do not change sibling products as part of website work.
- Work on `dev` and open a focused pull request from `dev` into `main` for the owner's review. Do not push changes directly to `main`, merge a pull request, or enable auto-merge without the owner's explicit instruction. Keep unrelated work out of an open review.
- Before starting the next change after a merge, fetch and synchronize `dev` with `origin/main`; preserve uncommitted work and do not force-push shared history. Keep commits focused and PR descriptions clear about what changed and how it was validated.
- Keep company facts in `site.config.json`. Use only confirmed legal details and contact information. Do not invent registration data, address, country, team size, customers, testimonials, or approvals.
- Walk n Sit is unreleased. Keep its status clear, and do not add App Store, download, pricing, or signup claims until the owner confirms release details.
- This is an Astro site with static output. Use `src/pages/` for routes, `src/components/` for reusable sections, and `src/layouts/SiteLayout.astro` for shared page metadata and chrome. Edit source, never generated `dist/` or `.astro/`.
- Read confirmed company values through `src/data/site.ts`. Astro escapes template expressions; use `site.emailHref` for email links. Reserve `set:html` for the safely serialized JSON-LD in the shared layout, never untrusted content.
- Keep global CSS in `src/styles/global.css` and unprocessed public assets in `public/assets/`. Avoid client-side frameworks and server adapters unless a concrete requirement warrants them. Keep styles external to preserve the CSP.
- Preserve the strict security headers in `vercel.json`. Inline executable scripts, event handlers, and style attributes are intentionally unsupported.
- Use Node.js 24 (`nvm use`) and `npm ci`. Run `npm run build` and `npm run check` after content or asset changes. `npm run dev` provides live updates; `npm run preview` serves the generated site with local equivalents of its production headers. Review desktop and mobile layouts in a real browser for visible changes.
- Add public pages to `src/pages/sitemap.xml.ts`. Keep the custom 404 page excluded from indexing. Production output uses clean URLs and HTML files for Vercel's static hosting.
- Vercel is connected to GitHub. Treat `main` as the production branch and changes pushed to `dev` as review work that may generate preview deployments. Do not manually deploy, change DNS, or promote a preview without an explicit request. Keep local validation, preview status, and production deployment status distinct.
- Do not add analytics, forms, tracking, or cookies without updating the privacy content to match actual behavior.
- Keep commits focused; do not add co-authorship attribution.
