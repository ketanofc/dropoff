import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Shell } from "../components/shell";
import { useTransfer } from "../lib/transfer-context";
import { formatBytes } from "../lib/transfer";

export const Route = createFileRoute("/share")({
  component: SharePage,
});

/** The transfer keeps running while the recipient is on this screen. */
function TransferStatus({ phase, sent, total }: { phase: string; sent: number; total: number }) {
  if (phase !== "transferring" && phase !== "complete") return null;

  const percent = total ? Math.min(100, (sent / total) * 100) : 0;

  return (
    <div className="mt-6">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="sending-shimmer relative h-full overflow-hidden rounded-full bg-primary transition-[width] duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {phase === "complete"
          ? "All files delivered"
          : `Sending ${percent.toFixed(0)}% · ${formatBytes(sent)} / ${formatBytes(total)}`}
      </p>
    </div>
  );
}

function SharePage() {
  const { link, phase, sent, total } = useTransfer();
  const [copied, setCopied] = useState(false);
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      // Clipboard can be blocked; the QR code still gives the recipient a way in.
    }
  }

  return (
    <Shell>
      <section className="py-16 text-center lg:py-24">
        <p className="eyebrow">Share the link</p>

        {link ? (
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
              <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
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

              <TransferStatus phase={phase} sent={sent} total={total} />
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-10 w-full max-w-xl rounded-2xl border border-border bg-card px-6 py-14">
            <p className="text-sm text-muted-foreground">No link yet. Start a transfer first.</p>
          </div>
        )}
      </section>
    </Shell>
  );
}
