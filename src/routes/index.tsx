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
      { title: "dropoff – secure file sharing!" },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "keywords", content: SITE_KEYWORDS },
      { property: "og:title", content: "dropoff – secure file sharing!" },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "dropoff – secure file sharing!" },
      { name: "twitter:description", content: SITE_DESCRIPTION },
    ],
    links: [canonical("/")],
    scripts: [jsonLd(webApplicationSchema), jsonLd(faqSchema)],
  }),
  component: SendFlow,
});
