/**
 * Converts a simplified domain string to regex
 * Handles normal domains like "learn.microsoft.com"
 * Handles wildcard domains like "*.microsoft.com"
 */
export function convertToRegex(domain) {
  domain = domain.trim();
  
  // Handle wildcard domains
  if (domain.startsWith('*')) {
    const escapedDomain = domain.slice(1).replace(/\./g, '\\.'); // Escape periods and remove leading "*"
    return `.*${escapedDomain}.*`;
  }

  // Handle regular domains
  const escapedDomain = domain.replace(/\./g, '\\.'); // Escape periods
  return `.*${escapedDomain}.*`;
}

/**
 * Converts regex back to simplified domain
 * Handles wildcard domains like ".*microsoft\.com.*" -> "*.microsoft.com"
 * Handles regular domains like ".*learn\.microsoft\.com.*" -> "learn.microsoft.com"
 */
export function convertToDomain(regex) {
  const domain = regex.replace(/^\.\*/, '').replace(/\\\./g, '.').replace(/\.\*$/, '');
  if (domain.startsWith('*')) {
    return `*${domain}`;
  }

  return domain;
}