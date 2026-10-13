# Routine Works Labs website

An **Astro** company website for **Routine Works Labs**, the brand of **Routine Works LTD**, at **www.routineworkslabs.com**. Walk n Sit is presented as coming soon, with no store or download link before release.

Astro generates static HTML and CSS, so the deployed site needs no application server or database. Shared layouts and components make it straightforward to add products and pages. The site uses local assets and fonts, with Vercel Web Analytics for aggregate visits and Speed Insights for browser performance measurements. It has no contact form or account system. The privacy page describes these tools, hosting logs, and company email.

## Develop locally

Use Node.js 24. The exact local version is recorded in `.nvmrc`.

```sh
cd website
nvm use
npm ci
npm run dev
```

Open the URL shown by Astro (normally `http://127.0.0.1:4321`). Changes to pages, components, and CSS update in the browser while you work.

## Branches and pull requests

Use `dev` for development and `main` for reviewed production changes. Push focused commits to `dev`, then open a pull request with `dev` as the source and `main` as the base. Include the purpose of the change, validation results, and a preview or screenshots when the page appearance changes. A PR template supplies these prompts.

Wait for the owner's review and explicit merge instruction. Do not push directly to `main` or enable auto-merge. After a PR is merged, fetch and synchronize `dev` with `origin/main` before starting the next change. Preserve uncommitted work and avoid force-pushing shared history.

Vercel's Git integration may build previews when `dev` is pushed. Keep `main` configured as the production branch, and review the relevant preview before merging visible changes. A successful preview does not mean the production site has been updated.

Maintain GitHub branch protection separately in the repository settings; these files document the workflow but do not configure its enforcement.

## Build and review

```sh
npm run build
npm run check
npm run preview
```

The build validates the confirmed company details, generates `dist/`, and checks local links, anchors, metadata, structured data, external scripts, analytics inclusion, app availability claims, and deployment settings. These output checks also run during Vercel builds. `npm run check` runs Astro's TypeScript diagnostics and repeats the output checks.

The production preview runs at `http://127.0.0.1:4173`. To use another port, run `PORT=4174 npm run preview`. It supports `/privacy`, serves the custom 404 with HTTP status 404, and applies the site's security headers. HTTPS upgrade is omitted only in this local HTTP preview. The development server is intended for editing; use the production preview to check the final build and security policy.

Before deployment, review desktop and narrow mobile layouts, navigation, the product status, contact link, privacy page, and an unknown URL. These checks do not confirm that the email inbox can receive messages.

## Analytics and performance

`src/components/SiteAnalytics.astro`, included once by the shared page layout, renders the official Vercel Web Analytics and Speed Insights Astro components only when `import.meta.env.PROD` is true and Vercel supplies `VERCEL=1`. Both initialize in the browser from external JavaScript assets. Local development and ordinary local builds omit the integration, so local preview requests do not send measurements or depend on Vercel's collection endpoints.

Enable both **Web Analytics** and **Speed Insights** in the Vercel project's dashboard. Installing their packages does not enable those project features. Vercel preview deployments can also send measurements, so distinguish preview traffic from production when reviewing results. No application secrets or custom analytics environment variables are needed.

To validate the generated integration locally, run `VERCEL=1 npm run build` followed by `VERCEL=1 npm run check`. Use the same flag for both commands so the checks expect the matching output. This simulates Vercel's build environment; the local preview server does not implement its collection endpoints.

Keep collection limited to page visits and performance measurements. Do not add custom events or user properties without reviewing the information they transmit and updating the privacy notice. The SDKs load Vercel's scripts and collection endpoints through the site's own origin, which works with the existing `script-src 'self'` and `connect-src 'self'` security policy. Do not allow inline execution or broad external origins to make an integration work.

For a Vercel preview, confirm both scripts load without CSP errors and that page-view and Web Vitals requests reach their endpoints. Successful local builds cannot verify Vercel's project settings or collection service. Refer to [Web Analytics privacy](https://vercel.com/docs/analytics/privacy-policy) and [Speed Insights privacy](https://vercel.com/docs/speed-insights/privacy-policy) when changing the integration.

## Update content

- **Company details:** edit `site.config.json`. It contains the brand, registered company name, hostname, public email, optional country, and privacy notice date. `src/data/site.ts` makes these values available to pages and components. Use only confirmed information; do not invent registration data or an address.
- **Homepage:** edit the sections in `src/components/`. Product information is in `ProductSection.astro`; shared navigation is in `Header.astro` and `Footer.astro`.
- **New pages:** create an `.astro` file in `src/pages/`, reuse `SiteLayout.astro` for metadata and navigation, and include a `<main id="main">` for the skip link. Add public page routes to `src/pages/sitemap.xml.ts`.
- **Design:** edit `src/styles/global.css`. Files in `public/assets/` are copied directly into the output; the small navigation script and actual Walk n Sit icon live there.
- **Privacy:** update `src/pages/privacy.astro` and its date whenever the site's actual data handling changes.

The production build requires a company name, hostname, public email, and update date. Country is optional and is not displayed until explicitly added to the page. Keep Walk n Sit marked **Coming soon** until its release details are confirmed.

## Deploy on Vercel

The site owner controls deployment and production merges. Vercel's Git integration can automatically deploy a push or merge to the configured production branch, so review changes through a pull request before merging into `main`.

1. Import your Git repository into Vercel. If the repository contains the parent workspace, set **Root Directory** to `website`. If this folder is the repository root, leave Root Directory at its default.
2. Select the **Astro** framework preset and Node.js **24.x**. The included `vercel.json` specifies **Build Command** `npm run build` and **Output Directory** `dist`. Vercel installs the dependencies from `package-lock.json` and provides the build environment used to include its analytics integrations. No custom environment variables, server adapter, or application server are required. Enable Web Analytics and Speed Insights in the project dashboard as described above.
3. Deploy and review the Vercel preview URL, including `/privacy` and a nonexistent path.
4. In **Settings → Domains**, use `www.routineworkslabs.com` as the primary domain and redirect `routineworkslabs.com` to it. Follow the DNS values Vercel displays for your project. Keep `site.config.json` aligned with the primary domain so canonical URLs, structured data, robots, and sitemap URLs use the final destination.
5. Verify the public domain loads over HTTPS without authentication or access restrictions. Check the contact link, page titles, navigation, privacy page, and mobile layout again.

Keep existing mail-related DNS records when connecting the website. Website deployment does not create an email mailbox; `hello@routineworkslabs.com` must be configured with your email provider separately if it is not already active.

References: [Astro on Vercel](https://docs.astro.build/en/guides/deploy/vercel/) and [Vercel custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain).

## Apple organization enrollment

Apple's [program enrollment requirements](https://developer.apple.com/help/account/membership/program-enrollment/) state that an organization needs a public, functional website whose domain is associated with the organization, with content beyond a minimal placeholder. Apple also requires an associated work email and checks the legal organization and D-U-N-S details separately.

This website identifies Routine Works LTD, connects it to the Routine Works Labs brand, explains the company's work, describes Walk n Sit honestly before release, and provides company contact and privacy information. Publish it on the company domain and verify its contact details before relying on it for enrollment. A completed website does not guarantee Apple enrollment or D-U-N-S approval.

## Project layout

```text
site.config.json           Confirmed company details
astro.config.mjs           Static Astro build and canonical domain
src/pages/                 Home, privacy, 404, robots, and sitemap routes
src/layouts/               Shared page shell and metadata
src/components/            Navigation, homepage sections, and SiteAnalytics
src/data/site.ts           Shared company configuration
src/styles/global.css      Responsive design
public/assets/             Icon, favicon, and navigation script
scripts/validate-config.mjs Company configuration validation
scripts/check.mjs          Generated-site checks
scripts/serve.mjs          Production preview with security headers
vercel.json                Astro deployment, clean URLs, and headers
dist/                      Generated output; not committed
```

The strict content security policy permits local scripts, styles, fonts, and images. Keep executable JavaScript and CSS in external files; avoid inline event handlers or style attributes. Safely serialized JSON-LD supplies structured company metadata. Astro is configured to emit external stylesheets and disable script asset inlining, including the analytics bootstraps.
