import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "../components/shell";
import { TextAnimate } from "../components/text-animate";

const INSPIRATION_IMG = "https://i.ibb.co/ZQ8pQCX/inspiration-dropoff.png";
const SOLUTION_IMG = "https://i.ibb.co/qMyT5c8B/img1.png";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About us – dropoff.lol" },
      { name: "description", content: "Why dropoff.lol exists and how it started." },
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
        <div className="mt-8 max-w-full text-[15px] leading-7 text-muted-foreground md:max-w-2xl lg:text-[16px]">
          <h2 className="font-serif text-[26px] font-normal leading-[1.15] text-foreground sm:text-[28px]">
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
            computer or mobile phone, there's no file size limits or speed limits, and if you're on
            the same network your data doesn't even have to leave the building.
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
