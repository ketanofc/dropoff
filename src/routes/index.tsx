import { createFileRoute } from "@tanstack/react-router";
import { SendFlow } from "../components/send-flow";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  canonical,
  faqSchema,
  jsonLd,
  webApplicationSchema,
} from "../lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dropoff – Secure Peer-to-Peer File Sharing" },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "keywords", content: SITE_KEYWORDS },
      { property: "og:title", content: "Dropoff – Secure Peer-to-Peer File Sharing" },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Dropoff – Secure Peer-to-Peer File Sharing" },
      { name: "twitter:description", content: SITE_DESCRIPTION },
    ],
    links: [canonical("/")],
    scripts: [jsonLd(webApplicationSchema), jsonLd(faqSchema)],
  }),
  component: SendFlow,
});
