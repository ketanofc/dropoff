import { createFileRoute } from "@tanstack/react-router";
import { SendFlow } from "../components/send-flow";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SOCIAL_DESCRIPTION,
  SOCIAL_TITLE,
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
      { property: "og:title", content: SOCIAL_TITLE },
      { property: "og:description", content: SOCIAL_DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SOCIAL_TITLE },
      { name: "twitter:description", content: SOCIAL_DESCRIPTION },
    ],
    links: [canonical("/")],
    scripts: [jsonLd(webApplicationSchema), jsonLd(faqSchema)],
  }),
  component: SendFlow,
});
