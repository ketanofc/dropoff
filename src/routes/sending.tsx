import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { Shell } from "../components/shell";
import { useTransfer } from "../lib/transfer-context";

export const Route = createFileRoute("/sending")({
  component: SendingPage,
});

function SendingPage() {
  const { files, phase, link, message, startTransfer, retryTransfer } = useTransfer();
  const navigate = useNavigate();

  // Entering this page means the user pressed Send file, so kick off the peer
  // here. Guarded on "idle" so a re-render never spawns a second one.
  useEffect(() => {
    if (phase === "idle") void startTransfer();
  }, [phase, startTransfer]);

  // Arriving here without files means the flow was entered cold.
  useEffect(() => {
    if (files.length === 0) void navigate({ to: "/" });
  }, [files.length, navigate]);

  // The link existing is the real milestone, so hand off to the celebration as
  // soon as it is ready rather than waiting on the recipient.
  useEffect(() => {
    if (!link) return;
    const timer = window.setTimeout(() => void navigate({ to: "/success" }), 350);
    return () => window.clearTimeout(timer);
  }, [link, navigate]);

  const isError = phase === "error";

  return (
    <Shell>
      <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        {isError ? (
          <>
            <p className="eyebrow">Could not start</p>
            <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">
              {message || "The connection could not be set up."}
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Button variant="outline" onClick={() => void navigate({ to: "/files" })}>
                Back to files
              </Button>
              <Button onClick={retryTransfer}>Try again</Button>
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow">{phase === "waiting" ? "Link created" : "Creating your link"}</p>
            <div className="mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-muted">
              <div className="sending-shimmer relative h-full w-full overflow-hidden rounded-full bg-primary" />
            </div>
            <p className="mt-5 max-w-xs text-xs text-muted-foreground">
              {message || "This only takes a moment."}
            </p>
          </>
        )}
      </section>
    </Shell>
  );
}
