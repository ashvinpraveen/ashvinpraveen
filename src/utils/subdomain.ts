/**
 * Utility functions for extracting and validating subdomains
 */

/**
 * Reserved subdomains that cannot be used for user profiles
 * These are common subdomains used for infrastructure and services
 */
export const RESERVED_SUBDOMAINS = new Set([
  // Infrastructure
  'www',
  'app',
  'api',
  'admin',
  'dashboard',

  // Environments
  'staging',
  'dev',
  'development',
  'test',
  'testing',
  'preview',
  'demo',

  // Email & Communication
  'mail',
  'email',
  'smtp',
  'imap',
  'pop',
  'webmail',

  // Common services
  'blog',
  'docs',
  'help',
  'support',
  'status',
  'cdn',
  'assets',
  'static',
  'media',
  'images',
  'files',

  // Authentication & Security
  'auth',
  'login',
  'signin',
  'sign-in',
  'signup',
  'sign-up',
  'logout',
  'register',
  'sso',

  // System pages
  'about',
  'contact',
  'privacy',
  'terms',
  'legal',
  'careers',
  'jobs',

  // Technical
  'ftp',
  'sftp',
  'ssh',
  'vpn',
  'proxy',
  'gateway',
  'redirect',

  // Marketing
  'marketing',
  'sales',
  'ads',
  'analytics',

  // Special
  'onboarding',
  'settings',
  'profile',
]);

/**
 * Extracts the subdomain from a hostname
 * @param hostname - The full hostname (e.g., "ashvin.cleve.ai" or "example.com")
 * @param baseDomain - The base domain to extract from (e.g., "cleve.ai")
 * @returns The subdomain or null if it's the base domain or a custom domain
 *
 * Examples:
 * - extractSubdomain("ashvin.cleve.ai", "cleve.ai") -> "ashvin"
 * - extractSubdomain("www.cleve.ai", "cleve.ai") -> "www"
 * - extractSubdomain("cleve.ai", "cleve.ai") -> null
 * - extractSubdomain("example.com", "cleve.ai") -> null (custom domain)
 */
export function extractSubdomain(hostname: string, baseDomain: string): string | null {
  if (!hostname || !baseDomain) return null;

  const normalizedHostname = hostname.toLowerCase().trim();
  const normalizedBaseDomain = baseDomain.toLowerCase().trim();

  // If hostname exactly matches base domain, no subdomain
  if (normalizedHostname === normalizedBaseDomain) {
    return null;
  }

  // If hostname ends with .baseDomain, extract the subdomain
  const suffix = `.${normalizedBaseDomain}`;
  if (normalizedHostname.endsWith(suffix)) {
    const subdomain = normalizedHostname.slice(0, -suffix.length);
    // Only return if it's a simple subdomain (no dots)
    if (subdomain && !subdomain.includes('.')) {
      return subdomain;
    }
  }

  // Otherwise it's likely a custom domain
  return null;
}

/**
 * Gets the base domain from environment or config
 * Removes protocol and www prefix if present
 */
export function getBaseDomain(siteUrl: string): string {
  let domain = siteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  // Remove www prefix if present
  if (domain.startsWith('www.')) {
    domain = domain.slice(4);
  }

  return domain.toLowerCase();
}

/**
 * Checks if a subdomain is reserved
 */
export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.has(subdomain.toLowerCase());
}

/**
 * Validates a subdomain format (same rules as slug validation)
 */
export function isValidSubdomainFormat(subdomain: string): boolean {
  return /^[a-z0-9-]{3,30}$/.test(subdomain.toLowerCase());
}

/**
 * Resolves a slug from either subdomain or custom domain
 * This is used by all user-facing pages to determine which site to show
 *
 * @param hostname - The request hostname
 * @param baseDomain - The base domain of the application
 * @param convexClient - A Convex client to query for custom domains
 * @returns The slug or null if not found
 */
export async function resolveSlugFromHostname(
  hostname: string,
  baseDomain: string,
  convexClient: any
): Promise<string | null> {
  const subdomain = extractSubdomain(hostname, baseDomain);

  if (subdomain) {
    // Accessing via subdomain (e.g., ashvin.cleve.ai)
    return subdomain;
  }

  // No subdomain - might be custom domain
  // Import api dynamically to avoid circular dependencies
  const { api } = await import('../../convex/_generated/api');
  const site = await convexClient.query(api.sites.getSiteByCustomDomain, { domain: hostname });

  if (site) {
    // This is a custom domain - use the site's slug
    return site.slug;
  }

  // Not a custom domain and not a subdomain
  return null;
}
