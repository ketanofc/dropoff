import { createFileRoute } from "@tanstack/react-router";
import { SendFlow } from "../components/send-flow";

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
  component: SendFlow,
});
