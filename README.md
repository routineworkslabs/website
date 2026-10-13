# Routine Works Labs website

An **Astro** company website for **Routine Works Labs**, the brand of **Routine Works LTD**, at **www.routineworkslabs.com**. Walk n Sit is presented as coming soon, with no store or download link before release.

Astro generates static HTML and CSS, so the deployed site needs no application server or database. Shared layouts and components make it straightforward to add products and pages. The site uses local assets and has no external fonts, third-party scripts, analytics, contact form, or application cookies. The privacy page covers hosting logs and company email separately.

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

These are repository working conventions; they do not enable GitHub branch protection or required approvals. Manage those separately in the repository settings if enforcement is needed.

## Build and review

```sh
npm run build
npm run check
npm run preview
```

The build validates the confirmed company details and generates `dist/`. The checks run Astro's TypeScript diagnostics, then verify generated local links, anchors, metadata, structured data, app availability claims, and deployment settings.

The production preview runs at `http://127.0.0.1:4173`. To use another port, run `PORT=4174 npm run preview`. It supports `/privacy`, serves the custom 404 with HTTP status 404, and applies the site's security headers. HTTPS upgrade is omitted only in this local HTTP preview. The development server is intended for editing; use the production preview to check the final build and security policy.

Before deployment, review desktop and narrow mobile layouts, navigation, the product status, contact link, privacy page, and an unknown URL. These checks do not confirm that the email inbox can receive messages.

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
2. Select the **Astro** framework preset and Node.js **24.x**. The included `vercel.json` specifies **Build Command** `npm run build` and **Output Directory** `dist`. Vercel installs the dependencies from `package-lock.json`. No environment variables, server adapter, or runtime services are required.
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
src/components/            Navigation and homepage sections
src/data/site.ts           Shared company configuration
src/styles/global.css      Responsive design
public/assets/             Icon, favicon, and navigation script
scripts/validate-config.mjs Company configuration validation
scripts/check.mjs          Generated-site checks
scripts/serve.mjs          Production preview with security headers
vercel.json                Astro deployment, clean URLs, and headers
dist/                      Generated output; not committed
```

The strict content security policy permits local scripts, styles, fonts, and images. Keep executable JavaScript and CSS in external files; avoid inline event handlers or style attributes. Safely serialized JSON-LD supplies structured company metadata. Astro is configured to emit external stylesheets.
