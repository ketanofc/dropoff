import { createFileRoute } from "@tanstack/react-router";
import { marked } from "marked";
import { PAGE_HEADING, Shell } from "../components/shell";
import { Button } from "../components/ui/button";
import termsMarkdown from "../content/terms.md?raw";
import { canonical, jsonLd, ogUrl, SITE_URL } from "../lib/seo";

const termsHtml = marked.parse(termsMarkdown);

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service – dropoff.lol" },
      {
        name: "description",
        content: "Terms of Service for using dropoff.lol's peer-to-peer file sharing service.",
      },
      { property: "og:title", content: "Terms of Service – dropoff.lol" },
      { property: "og:description", content: "Terms of Service for using dropoff.lol." },
      { property: "og:type", content: "website" },
      ogUrl("/terms"),
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [canonical("/terms")],
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${SITE_URL}/terms#terms`,
        url: `${SITE_URL}/terms`,
        name: "Terms of Service – dropoff.lol",
        description: "Terms of Service for using dropoff.lol's peer-to-peer file sharing service.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        inLanguage: "en",
      }),
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <Shell>
      <section className="py-20 lg:py-28">
        <h1 className={`max-w-2xl text-balance ${PAGE_HEADING}`}>Terms of use</h1>
        <div
          className="terms-content mt-10 max-w-2xl text-[15px] leading-7 text-muted-foreground lg:text-[16px]"
          dangerouslySetInnerHTML={{ __html: termsHtml }}
        />
        <p className="mt-8 max-w-2xl text-[15px] leading-7 text-muted-foreground">
          Looking to talk to a human? Our HQ inbox is{" "}
          <a
            href="mailto:admin.dropoff@gmail.com"
            className="text-foreground underline underline-offset-4"
          >
            admin.dropoff@gmail.com
          </a>
          .
        </p>
        <div className="mt-8">
          <a href="/">
            <Button variant="outline" size="sm">
              Back to dropoff.lol
            </Button>
          </a>
        </div>
      </section>
    </Shell>
  );
}
