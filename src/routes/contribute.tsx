import { useCallback, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Coffee, Mail, Share2 } from "lucide-react";
import { PAGE_HEADING, SECTION_HEADING, Shell } from "../components/shell";
import { Button } from "../components/ui/button";
import { canonical, jsonLd, ogUrl, SITE_URL } from "../lib/seo";

const BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/ketanofc";
const FEEDBACK_EMAIL = "admin.dropoff@gmail.com";

export const Route = createFileRoute("/contribute")({
  head: () => ({
    meta: [
      { title: "Contribute – dropoff.lol" },
      {
        name: "description",
        content:
          "Help dropoff.lol grow: share it with others, send feedback, or support the project so peer-to-peer file sharing stays free and simple.",
      },
      { property: "og:title", content: "Contribute – dropoff.lol" },
      {
        property: "og:description",
        content: "Help dropoff.lol grow and keep file sharing simple.",
      },
      { property: "og:type", content: "website" },
      ogUrl("/contribute"),
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [canonical("/contribute")],
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${SITE_URL}/contribute#contribute`,
        url: `${SITE_URL}/contribute`,
        name: "Contribute – dropoff.lol",
        description:
          "Help dropoff.lol grow: share it with others, send feedback, or support the project.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        inLanguage: "en",
      }),
    ],
  }),
  component: Contribute,
});

function Contribute() {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: "dropoff.lol",
      text: "Peer-to-peer file sharing, right in your browser.",
      url: SITE_URL,
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // The user dismissed the share sheet, or sharing is unavailable.
    }
  }, []);

  return (
    <Shell>
      <section className="py-20 lg:py-28">
        <h1 className={`max-w-2xl text-balance ${PAGE_HEADING}`}>Help dropoff.lol Grow</h1>
        <p className="mt-4 max-w-2xl text-[17px] leading-7 text-foreground lg:text-[18px]">
          Good things grow when we share them.
        </p>

        <div className="mt-8 max-w-2xl text-[15px] leading-7 text-muted-foreground lg:text-[16px]">
          <p>
            dropoff.lol exists to make file sharing simple. No accounts, no complicated setup, and
            no unnecessary uploads to cloud storage. Just drop a file, connect with someone, and
            share it.
          </p>
          <p className="mt-5">
            We're building a simpler way to share files, and we believe useful tools shouldn't need
            to be complicated.
          </p>
          <p className="mt-5">
            Big platforms have huge marketing budgets. We're a small independent project, so we rely
            on something much more valuable:{" "}
            <strong className="font-medium text-foreground">people like you.</strong>
          </p>

          <h2 className={`mt-12 text-foreground ${SECTION_HEADING}`}>Help us spread the word</h2>
          <p className="mt-3">
            If you find dropoff.lol useful, tell a friend, share it with your colleagues, or send it
            to someone who's tired of dealing with complicated file-sharing tools.
          </p>
          <p className="mt-5">
            Every recommendation helps more people discover a simpler way to share files.
          </p>
          <p className="mt-5 font-medium text-foreground">
            A small share can make a big difference.
          </p>

          <h2 className={`mt-12 text-foreground ${SECTION_HEADING}`}>
            Have an idea? We'd love to hear it.
          </h2>
          <p className="mt-3">
            Found a bug? Have a feature request? Think something could work better?
          </p>
          <p className="mt-5">
            We're always looking for ways to make dropoff.lol faster, simpler, and more useful. Your
            feedback helps us understand what matters most and what we should build next.
          </p>
          <p className="mt-5">Don't hesitate to reach out. Every suggestion is welcome.</p>

          <h2 className={`mt-12 text-foreground ${SECTION_HEADING}`}>A note from the developer</h2>
          <p className="mt-3">
            Hi! I'm an independent developer building dropoff.lol, a simple peer-to-peer
            file-sharing tool that lets people send files directly through their browsers without
            mandatory sign-ups.
          </p>
          <p className="mt-5">
            I'm building this project because sharing a file should be as easy as sharing a link. No
            unnecessary friction, no complicated workflows, just a tool that does what it's supposed
            to do.
          </p>
          <p className="mt-5">
            Most of my time goes into coding, fixing bugs, improving the experience, and figuring
            out how to make dropoff.lol better. It's a small project with a big idea, and I'm
            excited to see where it goes.
          </p>
          <p className="mt-5">
            Your support helps me keep improving the platform, cover any infrastructure costs, and
            fuel those late-night coding sessions with some much-needed coffee.
          </p>
          <p className="mt-5 font-medium text-foreground">
            Thanks for being part of the journey. Every bit of support means a lot.
          </p>

          <h2 className={`mt-12 text-foreground ${SECTION_HEADING}`}>Support the project</h2>
          <p className="mt-3">Like using dropoff.lol? Want to help it grow?</p>
          <p className="mt-5">
            If you'd like to support the project financially, consider buying me a coffee. Every
            contribution helps support ongoing development and the costs of keeping the service
            running.
          </p>
          <p className="mt-5">
            No pressure, though. Sharing dropoff.lol with someone is already a great way to help.
          </p>
          <p className="mt-5 font-medium text-foreground">Built with care, shared with everyone.</p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button type="button" onClick={handleShare}>
            <Share2 className="size-4" />
            {copied ? "Link copied!" : "Share dropoff.lol"}
          </Button>
          <a href={BUY_ME_A_COFFEE_URL} target="_blank" rel="noreferrer">
            <Button variant="outline">
              <Coffee className="size-4" />
              Buy me a coffee
            </Button>
          </a>
          <a href={`mailto:${FEEDBACK_EMAIL}`}>
            <Button variant="outline">
              <Mail className="size-4" />
              Share feedback
            </Button>
          </a>
        </div>

        <div className="mt-12">
          <a href="/">
            <Button>Back to dropoff.lol</Button>
          </a>
        </div>
      </section>
    </Shell>
  );
}
