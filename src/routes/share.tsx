import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { SECTION_HEADING, Shell } from "../components/shell";
import { useTransfer } from "../lib/transfer-context";

export const Route = createFileRoute("/share")({
  component: SharePage,
});

function SharePage() {
  const { link } = useTransfer();
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
        <h1 className={`mx-auto mt-3 max-w-2xl text-balance ${SECTION_HEADING}`}>
          Scan to receive
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
          Open this on the other device to start the transfer.
        </p>

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
