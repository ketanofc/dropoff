import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "../components/shell";
import { TextAnimate } from "../components/text-animate";

export const Route = createFileRoute("/manifesto")({
  head: () => ({
    meta: [
      { title: "Manifesto – dropoff.lol" },
      { name: "description", content: "Why dropoff.lol exists." },
    ],
  }),
  component: Manifesto,
});

function Manifesto() {
  return (
    <Shell>
      <section className="pt-[58px] sm:pt-16 lg:pt-24">
        <TextAnimate
          animation="blurIn"
          as="h1"
          className="max-w-[440px] font-serif text-[40px] font-normal leading-[1.06] tracking-normal sm:text-[48px] lg:text-[60px] lg:leading-[1.03]"
        >
          Manifesto
        </TextAnimate>
        <div className="mt-8 max-w-full space-y-5 text-[15px] leading-7 text-muted-foreground md:max-w-2xl lg:text-[16px]">
          <p>
            Files should move between people directly, not sit parked on a server. That is the whole
            idea behind dropoff.lol: a transfer is a private moment between two browsers, and when
            it is over, there is nothing left behind.
          </p>
          <p>We believe in a few simple things:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-foreground">Privacy by design.</strong> Your file never gets
              stored by us, because it never comes to us.
            </li>
            <li>
              <strong className="text-foreground">No accounts.</strong> A browser is all you need.
              Respecting your attention is part of respecting your data.
            </li>
            <li>
              <strong className="text-foreground">Ephemeral by default.</strong> The link is only
              alive while the sender keeps the tab open, and that is the point, not a bug.
            </li>
            <li>
              <strong className="text-foreground">Simple tools, done well.</strong> Pick a file,
              share a link, and get out of the way.
            </li>
          </ul>
          <p>
            If you share these ideas and want to help grow dropoff.lol, we would love to hear from
            you at{" "}
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
