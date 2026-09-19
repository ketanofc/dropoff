import { createFileRoute } from "@tanstack/react-router";
import { Github } from "lucide-react";
import { Shell } from "../components/shell";
import { TextAnimate } from "../components/text-animate";
import { canonical, jsonLd, ogUrl, SITE_URL } from "../lib/seo";

const INSPIRATION_IMG = "https://i.ibb.co/ZQ8pQCX/inspiration-dropoff.png";
const SOLUTION_IMG = "https://i.ibb.co/qMyT5c8B/img1.png";
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
      <section className="pt-[88px] sm:pt-24 lg:pt-32">
        <div className="mx-auto w-full max-w-[720px]">
          <TextAnimate
            animation="blurIn"
            as="h1"
            className="mx-auto mt-5 text-balance text-center font-serif text-[40px] font-normal leading-[1.06] tracking-normal sm:text-[48px] lg:text-[60px] lg:leading-[1.03]"
          >
            About us
          </TextAnimate>

          <div className="mx-auto mt-8 max-w-full text-[15px] leading-7 text-muted-foreground md:max-w-2xl lg:text-[16px]">
            <p>
              dropoff.lol is a small project with a simple goal: let anyone send a file to anyone
              else without accounts, without uploads, and without the cloud standing in the middle.
              Every transfer is a private, direct connection between two browsers, and when it is
              over, nothing is left behind.
            </p>
            <p className="mt-5">
              It is built with React, TypeScript, and TanStack Start on top of WebRTC, and it runs
              entirely in your browser. We think file sharing should be as easy as pointing a friend
              at a page and pressing send, so that is exactly what we built.
            </p>

            <div className="mt-8 rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Github className="size-4" /> Open source
              </div>
              <p className="mt-2 leading-7">
                dropoff.lol is released under the BSD 3-Clause license. The full source code lives
                on GitHub, so anyone can read exactly how a transfer works, or help make it better.
              </p>
              <a
                href={SOURCE_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-accent"
              >
                <Github className="size-4" /> View source on GitHub
              </a>
            </div>

            <h2 className="mt-10 font-serif text-[26px] font-normal leading-[1.15] text-foreground sm:text-[28px]">
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
              className="my-8 w-full max-w-[560px] rounded-lg"
            />

            <h2 className="font-serif text-[26px] font-normal leading-[1.15] text-foreground sm:text-[28px]">
              Building a solution
            </h2>
            <p className="mt-3">
              It simply had to change, so we started working on a solution: dropoff.lol. With
              dropoff.lol nothing is ever stored online, you send your files directly from your
              computer or mobile phone, there's no file size limits or speed limits, and if you're
              on the same network your data doesn't even have to leave the building.
            </p>
            <p className="mt-5 font-medium text-foreground">
              In our opinion: file transfer as it should be.
            </p>
            <img
              src={SOLUTION_IMG}
              alt="Two people transferring a file directly between their browsers with dropoff.lol"
              loading="lazy"
              className="my-8 w-full max-w-[560px] rounded-lg"
            />

            <p className="mt-5">
              We are just getting started, and there is more to come. If you have feedback, a
              feature idea, or just want to say hello, email us at{" "}
              <a
                href="mailto:admin.dropoff@gmail.com"
                className="text-foreground underline underline-offset-4"
              >
                admin.dropoff@gmail.com
              </a>
              .
            </p>
          </div>

          <a
            href="/"
            className="mt-8 inline-block text-sm font-medium underline underline-offset-4"
          >
            Back to dropoff.lol
          </a>
        </div>
      </section>
    </Shell>
  );
}
