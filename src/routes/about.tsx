import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "../components/shell";
import { TextAnimate } from "../components/text-animate";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About us – dropoff.lol" },
      { name: "description", content: "Who is behind dropoff.lol." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <Shell>
      <section className="pt-[58px] sm:pt-16 lg:pt-24">
        <TextAnimate
          animation="blurIn"
          as="h1"
          className="max-w-[440px] font-serif text-[40px] font-normal leading-[1.06] tracking-normal sm:text-[48px] lg:text-[60px] lg:leading-[1.03]"
        >
          About us
        </TextAnimate>
        <div className="mt-8 max-w-full space-y-5 text-[15px] leading-7 text-muted-foreground md:max-w-2xl lg:text-[16px]">
          <p>
            dropoff.lol is a small project with a simple goal: let anyone send a file to anyone else
            without accounts, without uploads, and without the cloud standing in the middle.
          </p>
          <p>
            The whole service runs on WebRTC, the browser technology that lets two devices talk
            directly to each other. When you start a transfer, your chosen file streams straight
            from your browser to the recipient's browser. We never see the contents of your files,
            because they never pass through a server.
          </p>
          <p>
            Today the site is built with React, TypeScript, and TanStack Start, and it is hosted on
            Vercel. It is open source under a BSD 3-Clause license, so anyone can read the code and
            see exactly how a transfer works.
          </p>
          <p>
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
        </div>
        <a href="/" className="mt-8 inline-block text-sm font-medium underline underline-offset-4">
          Back to dropoff.lol
        </a>
      </section>
    </Shell>
  );
}
