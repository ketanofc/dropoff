export const SITE_URL = "https://dropoff.lol";
export const SITE_NAME = "dropoff.lol";
export const SITE_TAGLINE =
  "Private, browser-to-browser file sharing. No accounts, no uploads, no storage.";
export const CONTACT_EMAIL = "admin.dropoff@gmail.com";
export const SOURCE_URL = "https://github.com/ketanofc/dropoff";

export const canonical = (path: string) => ({ rel: "canonical", href: `${SITE_URL}${path}` });

export const ogUrl = (path: string) => ({ property: "og:url", content: `${SITE_URL}${path}` });

export const jsonLd = (data: object) => ({
  type: "application/ld+json",
  children: JSON.stringify(data),
});

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  alternateName: "dropoff",
  description: SITE_TAGLINE,
  inLanguage: "en",
  publisher: {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    email: CONTACT_EMAIL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/favicon.svg`,
    },
    sameAs: [SOURCE_URL],
  },
};
