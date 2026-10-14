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
          "Ways to help dropoff.lol grow: share it with others, send feedback, or support ongoing development so file sharing stays free and simple.",
      },
      { property: "og:title", content: "Contribute – dropoff.lol" },
      {
        property: "og:description",
        content: "Share dropoff.lol, send feedback, or support the project.",
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
          "Ways to help dropoff.lol grow: share it with others, send feedback, or support ongoing development.",
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
        <h1 className={`max-w-2xl text-balance ${PAGE_HEADING}`}>Contribute</h1>

        <div className="mt-10 max-w-2xl text-[15px] leading-7 text-muted-foreground lg:text-[16px]">
          <p>
            dropoff.lol started with a simple annoyance: sending a file to someone shouldn't need an
            account, a subscription, or a detour through somebody else's servers. It is a small,
            independent project, and it stays useful because the people who use it choose to help it
            grow.
          </p>
          <p className="mt-5">
            Everything here is built and maintained by one developer, which means there is no
            marketing department and no growth team. What there is instead is you, the person
            reading this. Word of mouth from people who genuinely find dropoff.lol useful does more
            for the project than any campaign ever could.
          </p>

          <h2 className={`mt-12 text-foreground ${SECTION_HEADING}`}>Spread the word</h2>
          <p className="mt-3">
            If dropoff.lol has been useful to you, the single most helpful thing you can do is tell
            someone else about it. Send it to a colleague who is tired of wrestling with upload
            limits, share it with a friend who wants to move a file between two devices, or mention
            it wherever a simpler way to share would help.
          </p>
          <p className="mt-5">
            There is nothing to sign up for, so it is an easy recommendation to pass along. Every
            share, however small, brings more people to a tool that respects their privacy.
          </p>

          <h2 className={`mt-12 text-foreground ${SECTION_HEADING}`}>Tell us what you think</h2>
          <p className="mt-3">
            Found a bug, thought of a feature, or noticed something that could work a little better?
            I want to hear about it. Feedback is what shapes what gets built next, and honest
            criticism is often more valuable than praise.
          </p>
          <p className="mt-5">
            Reach out any time. Every suggestion gets read, and every report makes the project a
            little more reliable for everyone.
          </p>

          <h2 className={`mt-12 text-foreground ${SECTION_HEADING}`}>A note from the developer</h2>
          <p className="mt-3">
            Hello, I'm the developer behind dropoff.lol. I build and run this project on my own
            because I think sharing a file should be as straightforward as sharing a link. No forced
            sign-ups, no needless steps, just a tool that does the one thing it promises.
          </p>
          <p className="mt-5">
            Most of my time goes into writing code, chasing down bugs, and trying to make the
            experience a little smoother with each release. It is a small project with a
            straightforward idea, and I am glad to have you along for it.
          </p>
          <p className="mt-5">
            Keeping dropoff.lol running and independent does come with costs. If you would like to
            help cover them, you can buy me a coffee below. But that is entirely optional; using the
            tool and passing it on already goes a long way.
          </p>

          <h2 className={`mt-12 text-foreground ${SECTION_HEADING}`}>Support the project</h2>
          <p className="mt-3">
            dropoff.lol has no ads, no paid tiers, and no investors to answer to. It stays free for
            everyone, and it stays that way because of people who choose to chip in.
          </p>
          <p className="mt-5">
            If you are in a position to contribute financially, a coffee goes directly toward
            development time and the cost of running the service. If you are not, that is completely
            fine. Sharing the site with someone new helps just as much.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button type="button" onClick={handleShare}>
            <Share2 className="size-4" />
            {copied ? "Link copied!" : "Share"}
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

        <p className="mt-12 text-[15px] text-muted-foreground">
          <a
            href="/"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            Back to home
          </a>
        </p>
      </section>
    </Shell>
  );
}
