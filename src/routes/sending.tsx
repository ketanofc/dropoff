import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Copy, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { SECTION_HEADING, Shell } from "../components/shell";
import { useTransfer } from "../lib/transfer-context";
import { formatBytes } from "../lib/transfer";

export const Route = createFileRoute("/sending")({
  component: SendingPage,
});

function SendingPage() {
  const { files, phase, link, sent, total, message, startTransfer } = useTransfer();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  // Entering this page means the user pressed Start transfer, so kick it off
  // here. Guarded on "idle" so a re-render never spawns a second peer.
  useEffect(() => {
    if (phase === "idle") void startTransfer();
  }, [phase, startTransfer]);

  // Arriving here without files means the flow was entered cold.
  useEffect(() => {
    if (files.length === 0) void navigate({ to: "/" });
  }, [files.length, navigate]);

  // Hand off to the celebration screen once the bytes are all sent.
  useEffect(() => {
    if (phase !== "complete") return;
    const timer = window.setTimeout(() => void navigate({ to: "/success" }), 400);
    return () => window.clearTimeout(timer);
  }, [phase, navigate]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked; the QR code is still a working path.
    }
  }

  const percent = total ? (sent / total) * 100 : 0;
  const isTransferring = phase === "transferring";
  const isError = phase === "error";
  const isDone = phase === "complete";

  const heading = isError ? "Transfer stopped" : isDone ? "Finishing up" : "Sending your files";
  const detail = isError
    ? message || "The connection was lost."
    : isTransferring
      ? "Keep this tab open while the files move across."
      : message || "Preparing the connection…";

  return (
    <Shell>
      <section className="py-16 text-center lg:py-24">
        <p className="eyebrow">Step 2 of 3</p>
        <h1 className={`mx-auto mt-3 max-w-2xl text-balance ${SECTION_HEADING}`}>{heading}</h1>

        <div className="mx-auto mt-6 flex max-w-xl justify-center">
          <div className="relative flex size-14 items-center justify-center">
            {!isError && !isDone && (
              <span className="absolute size-full animate-ping rounded-full bg-foreground opacity-10" />
            )}
            <span
              className={`relative size-3 rounded-full ${isError ? "bg-destructive" : "bg-foreground"}`}
            />
          </div>
        </div>

        <p className="mx-auto mt-6 max-w-md text-sm text-muted-foreground">{detail}</p>

        {isTransferring && (
          <div className="mx-auto mt-8 max-w-xl">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="sending-shimmer relative h-full overflow-hidden rounded-full bg-primary transition-[width] duration-200"
                style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{percent.toFixed(0)}%</span>
              <span>
                {formatBytes(sent)} / {formatBytes(total)}
              </span>
            </div>
          </div>
        )}

        {/* The QR has to live here: PeerJS cannot move any bytes until the
            recipient opens the link and accepts. */}
        {link && !isError && (
          <div className="mx-auto mt-10 w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex justify-center bg-muted px-5 py-8 sm:px-8 sm:py-10">
              <QRCodeSVG
                value={link}
                size={280}
                level="Q"
                fgColor="#000000"
                bgColor="#ffffff"
                className="h-auto w-full max-w-[190px] sm:max-w-[280px]"
              />
            </div>

            <div className="border-t border-border px-5 py-6 text-center sm:px-8 sm:py-7">
              <p className="text-sm font-medium">
                {isTransferring ? "Recipient is downloading" : "Scan to receive"}
              </p>
              <div className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Button className="w-full sm:w-auto" onClick={() => void copyLink()}>
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copied" : "Copy link"}
                </Button>
                {canShare && (
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => navigator.share({ title: "dropoff", url: link }).catch(() => {})}
                  >
                    <Share2 className="size-4" />
                    Share
                  </Button>
                )}
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                Leave this tab open, dropoff does not store files.
              </p>
            </div>
          </div>
        )}
      </section>
    </Shell>
  );
}
