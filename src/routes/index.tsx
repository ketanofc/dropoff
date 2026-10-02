import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Upload } from "lucide-react";
import { useRef } from "react";
import { Button } from "../components/ui/button";
import { HERO_HEADING, Shell } from "../components/shell";
import { useTransfer } from "../lib/transfer-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "dropoff – file sharing!" },
      {
        name: "description",
        content:
          "Send files peer to peer, right from your browser. No permanent uploads and no account required.",
      },
      { property: "og:title", content: "dropoff – file sharing!" },
      {
        property: "og:description",
        content:
          "Send files peer to peer, right from your browser. No permanent uploads and no account required.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { addFiles } = useTransfer();
  const inputRef = useRef<HTMLInputElement>(null);

  function openFilePicker() {
    if (!inputRef.current) return;
    inputRef.current.value = "";
    inputRef.current.click();
  }

  return (
    <Shell>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      <section className="py-20 text-center lg:py-28">
        <h1 className={`mx-auto max-w-3xl text-balance ${HERO_HEADING}`}>
          Send Files Right From Your <span className="stripe-accent">Browser</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
          peer to peer file transfers, no limits, no permanent uploads, and no account required.
        </p>
        <div className="mt-10 flex justify-center">
          <Button type="button" onClick={openFilePicker}>
            <Upload className="size-4" />
            SELECT FILE TO SHARE
            <ArrowRight className="button-arrow size-4" />
          </Button>
        </div>
      </section>
    </Shell>
  );
}
