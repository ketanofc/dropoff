import { createFileRoute } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { HERO_HEADING, SECTION_HEADING, Shell } from "../components/shell";
import { Button } from "../components/ui/button";
import { canonical, jsonLd, ogUrl, SITE_URL } from "../lib/seo";

const INSPIRATION_IMG = "https://i.ibb.co/ZQ8pQCX/inspiration-dropoff.png";
const SOURCE_URL = "https://github.com/ketanofc/dropoff";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About us – dropoff.lol" },
      {
        name: "description",
        content:
          "Why dropoff.lol exists, how it started, and the problem it solves — private browser-to-browser file sharing.",
      },
      { property: "og:title", content: "About us – dropoff.lol" },
      { property: "og:description", content: "Why dropoff.lol exists and how it started." },
      { property: "og:type", content: "website" },
      ogUrl("/about"),
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [canonical("/about")],
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "@id": `${SITE_URL}/about#about`,
        url: `${SITE_URL}/about`,
        name: "About us – dropoff.lol",
        description: "Why dropoff.lol exists, how it started, and the problem it solves.",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: "dropoff.lol",
          url: `${SITE_URL}/`,
          email: "admin.dropoff@gmail.com",
          sameAs: [SOURCE_URL],
        },
      }),
    ],
  }),
  component: About,
});

function About() {
  return (
    <Shell>
      <section className="py-20 lg:py-28">
        <h1 className={`max-w-2xl text-balance ${HERO_HEADING}`}>About us</h1>

        <div className="mt-10 max-w-2xl text-[15px] leading-7 text-muted-foreground lg:text-[16px]">
          <p>
            dropoff.lol is a small project with a simple goal: let anyone send a file to anyone else
            without accounts, without uploads, and without the cloud standing in the middle. Every
            transfer is a private, direct connection between two browsers, and when it is over,
            nothing is left behind.
          </p>
          <p className="mt-5">
            It is built with React, TypeScript, and TanStack Start on top of WebRTC, and it runs
            entirely in your browser. We think file sharing should be as easy as pointing a friend
            at a page and pressing send, so that is exactly what we built.
          </p>

          <div className="mt-8 rounded-3xl border border-border bg-card p-6 text-left">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Github className="size-4" /> Open source
            </div>
            <p className="mt-2 leading-7">
              dropoff.lol is released under the BSD 3-Clause license. The full source code lives on
              GitHub, so anyone can read exactly how a transfer works, or help make it better.
            </p>
            <a href={SOURCE_URL} target="_blank" rel="noreferrer" className="mt-6 inline-block">
              <Button variant="outline" size="sm">
                <Github className="size-4" /> View source on GitHub
              </Button>
            </a>
          </div>

          <h2 className={`mt-12 text-foreground ${SECTION_HEADING}`}>
            There had to be another way
          </h2>
          <p className="mt-3">
            This wasn't the first time this had happened. Sending large files via email or with
            third party tools such as WhatsApp or Slack is impossible. It forces you to use yet
            another third party service with annoying limitations such as file size limits, speed
            limits, or required registration.
          </p>
          <p className="mt-5">
            There's always a catch, and no matter which service you use, your files always end up
            stored somewhere on the internet on an unknown server.
          </p>
          <img
            src={INSPIRATION_IMG}
            alt="An emblem about skipping the middleman and sending files straight from device to device"
            loading="lazy"
            className="my-8 w-full max-w-[560px] rounded-2xl"
          />

          <h2 className={`mt-12 text-foreground ${SECTION_HEADING}`}>Building a solution</h2>
          <p className="mt-3">
            It simply had to change, so we started working on a solution: dropoff.lol. With
            dropoff.lol nothing is ever stored online, you send your files directly from your
            computer or mobile phone, there's no file size limits or speed limits, and if you're on
            the same network your data doesn't even have to leave the building.
          </p>
          <p className="mt-5 font-medium text-foreground">
            In our opinion: file transfer as it should be.
          </p>

          <p className="mt-5">
            We are just getting started, and there is more to come. If you have feedback, a feature
            idea, or just want to say hello, email us at{" "}
            <a
              href="mailto:admin.dropoff@gmail.com"
              className="text-foreground underline underline-offset-4"
            >
              admin.dropoff@gmail.com
            </a>
            .
          </p>

          <div className="mt-12">
            <a href="/">
              <Button variant="outline" size="sm">
                Back to dropoff.lol
              </Button>
            </a>
          </div>
        </div>
      </section>
    </Shell>
  );
}
