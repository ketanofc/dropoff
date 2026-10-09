export const SITE_URL = "https://dropoff.lol";
export const SITE_DOMAIN = "dropoff.lol";
export const SITE_NAME = "Dropoff";
export const SITE_TAGLINE =
  "Private, browser-to-browser file sharing. No accounts, no uploads, no storage.";
export const SITE_DESCRIPTION =
  "Dropoff is a free, secure, zero-backend file sharing tool that sends files directly between browsers over an encrypted peer-to-peer WebRTC connection. No uploads, no accounts, and nothing is ever stored on a server.";
export const SITE_KEYWORDS = [
  "dropoff",
  "peer to peer file sharing",
  "p2p file transfer",
  "browser to browser file transfer",
  "WebRTC file sharing",
  "send large files",
  "no upload file sharing",
  "private file transfer",
  "zero backend",
  "client-side file tool",
].join(", ");
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
      url: `${SITE_URL}/android-chrome-512x512.png`,
    },
    sameAs: [SOURCE_URL],
  },
};

export const webApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}/#webapp`,
  name: SITE_NAME,
  alternateName: "dropoff",
  url: `${SITE_URL}/`,
  description: SITE_DESCRIPTION,
  applicationCategory: "UtilitiesApplication",
  applicationSubCategory: "File Sharing",
  operatingSystem: "Windows, macOS, Linux, iOS, Android",
  browserRequirements: "Requires a modern browser with WebRTC support.",
  isAccessibleForFree: true,
  inLanguage: "en",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Client-side file processing with no backend handling file data",
    "Zero server upload: files stream directly between browsers",
    "Encrypted peer-to-peer WebRTC transfers",
    "One-time, unguessable share links",
    "No accounts, no registration, no sign-in",
    "No server-side file size limit",
  ],
  publisher: { "@id": `${SITE_URL}/#organization` },
};

/**
 * Single source of truth for the FAQ. The same entries drive both the visible
 * markup and the FAQPage JSON-LD, so the structured data can never drift from
 * what a reader sees.
 */
export const FAQS = [
  {
    question: "What is Dropoff?",
    answer:
      "Dropoff is a free, browser-based file sharing tool. It sends files directly from one device to another over a peer-to-peer WebRTC connection, so files never pass through or get stored on a server.",
  },
  {
    question: "Are my files uploaded to a server?",
    answer:
      "No. Dropoff is fully client-side and has no backend file storage. Your files stream directly between the two browsers, which means nothing is uploaded, scanned, logged, or retained.",
  },
  {
    question: "Is Dropoff free to use?",
    answer:
      "Yes. Dropoff is completely free. There is no account, no sign-up, no subscription, and no hidden fee.",
  },
  {
    question: "What is the maximum file size?",
    answer:
      "Because nothing is uploaded, there is no server-side size limit. The practical limit is what your browser can hold in memory, roughly 1 to 2 GB on desktop Chrome, about 1 GB on Firefox, and a few hundred MB on iPhone or iOS Safari.",
  },
  {
    question: "Do I need to keep the browser tab open during a transfer?",
    answer:
      "Yes. Your browser is the source of the files, so the sender's tab must stay open until the transfer finishes. Closing it ends the connection.",
  },
  {
    question: "How does Dropoff keep transfers private?",
    answer:
      "Transfers use WebRTC, which encrypts peer-to-peer traffic, and every share link is a random one-time URL. Files are never uploaded or stored, so there is nothing to expose after the transfer ends.",
  },
];

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#faq`,
  mainEntity: FAQS.map((entry) => ({
    "@type": "Question",
    name: entry.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: entry.answer,
    },
  })),
};
