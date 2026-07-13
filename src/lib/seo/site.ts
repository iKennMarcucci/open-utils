/**
 * Single source of truth for the site's identity and absolute URLs.
 *
 * Every canonical, sitemap entry, Open Graph tag and JSON-LD `@id` derives from
 * `SITE_URL`. Keep it here so the Vercel preview domain never leaks into markup
 * that tells Google which URL is the real one.
 */

/**
 * Set `NEXT_PUBLIC_SITE_URL` in Vercel to override (e.g. for a staging domain).
 * The default is the production domain, on purpose: canonical/OG/JSON-LD must
 * point at openutils.co even while the app is still served from *.vercel.app,
 * so link equity consolidates on the real domain from day one.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://openutils.co"
).replace(/\/$/, "");

export const SITE_NAME = "Open Utils";
export const SITE_LOCALE = "es_ES";
export const SITE_LANG = "es";

export const REPO_URL = "https://github.com/iKennMarcucci/open-utils";
export const AUTHOR_NAME = "Kenn Marcucci";
export const AUTHOR_URL = "https://github.com/iKennMarcucci";
export const LICENSE_URL = "https://opensource.org/license/mit";

/** Stable JSON-LD node ids, so entities can cross-reference instead of repeating. */
export const ORG_ID = `${SITE_URL}/#organization`;
export const PERSON_ID = `${SITE_URL}/#kenn`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const absoluteUrl = (path = "/") =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
