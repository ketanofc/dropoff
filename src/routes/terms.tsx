import { createFileRoute } from "@tanstack/react-router";
import { marked } from "marked";
import { Shell } from "../components/shell";
import { TextAnimate } from "../components/text-animate";
import termsMarkdown from "../content/terms.md?raw";

const termsHtml = marked.parse(termsMarkdown);

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms – dropoff.lol" },
      { name: "description", content: "Terms for using dropoff.lol." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <Shell>
      <section className="pt-[70px] sm:pt-20 lg:pt-28">
        <TextAnimate
          animation="blurIn"
          as="h1"
          className="max-w-[440px] font-serif text-[40px] font-normal leading-[1.06] tracking-normal sm:text-[48px] lg:text-[60px] lg:leading-[1.03]"
        >
          Terms of use
        </TextAnimate>
        <div
          className="terms-content mt-8 max-w-full text-[15px] leading-7 text-muted-foreground md:max-w-2xl lg:text-[16px]"
          dangerouslySetInnerHTML={{ __html: termsHtml }}
        />
        <p className="mt-8 max-w-full text-[15px] leading-7 text-muted-foreground md:max-w-2xl">
          Looking to talk to a human? Our HQ inbox is{" "}
          <a
            href="mailto:admin.dropoff@gmail.com"
            className="text-foreground underline underline-offset-4"
          >
            admin.dropoff@gmail.com
          </a>
          .
        </p>
        <a href="/" className="mt-8 inline-block text-sm font-medium underline underline-offset-4">
          Back to dropoff.lol
        </a>
      </section>
    </Shell>
  );
}
