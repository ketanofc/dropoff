import { ArrowRight, Check, Copy, Plus, Share2, Upload, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { FileKindIcon, fileKindLabel } from "./file-icon";
import { SuccessTick } from "./success-tick";
import { HERO_HEADING, SECTION_HEADING, Shell } from "./shell";
import { Button } from "./ui/button";
import { useTransfer } from "../lib/transfer-context";
import { formatBytes } from "../lib/transfer";

/**
 * The whole sending experience lives here as a sequence of stages instead of
 * separate routes. The peer connection is owned by TransferProvider above this,
 * so switching stages never interrupts an in-flight transfer.
 *
 * The recipient still gets their own route (/receive/$id) because the QR code
 * is opened on a different device, but the sender never leaves this page.
 */
type Stage = "select" | "review" | "linking" | "celebrate" | "share";

export function SendFlow() {
  const {
    files,
    addFiles,
    removeFile,
    phase,
    link,
    sent,
    total,
    message,
    startTransfer,
    retryTransfer,
    reset,
  } = useTransfer();
  const [stage, setStage] = useState<Stage>("select");
  const inputRef = useRef<HTMLInputElement>(null);

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  function openFilePicker() {
    if (!inputRef.current) return;
    inputRef.current.value = "";
    inputRef.current.click();
  }

  function handlePicked(picked: File[]) {
    if (picked.length === 0) return;
    addFiles(picked);
    setStage("review");
  }

  // Entering the linking stage means Send file was pressed, so start the peer
  // here. Guarded on "idle" so a re-render never spawns a second one.
  useEffect(() => {
    if (stage === "linking" && phase === "idle") void startTransfer();
  }, [stage, phase, startTransfer]);

  // The link existing is the real milestone, so celebrate as soon as it is ready
  // rather than waiting on the recipient.
  useEffect(() => {
    if (stage !== "linking" || !link) return;
    const timer = window.setTimeout(() => setStage("celebrate"), 350);
    return () => window.clearTimeout(timer);
  }, [stage, link]);

  // Removing the last file has nothing to review, so fall back to the start.
  useEffect(() => {
    if (files.length === 0 && stage !== "select" && phase === "idle") setStage("select");
  }, [files.length, stage, phase]);

  function startOver() {
    reset();
    setStage("select");
  }

  return (
    <Shell>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        onChange={(event) => {
          const picked = Array.from(event.target.files ?? []);
          event.target.value = "";
          handlePicked(picked);
        }}
      />

      {stage === "select" && (
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
      )}

      {stage === "review" && (
        <section className="py-14 text-center lg:py-20">
          <p className="eyebrow">Review</p>

          <div className="mx-auto mt-8 max-w-xl overflow-hidden rounded-2xl border border-border bg-card text-left">
            <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
              <span className="text-sm font-medium">Files</span>
              <span className="text-xs text-muted-foreground">
                {files.length === 1 ? "1 file" : `${files.length} files`} · {formatBytes(totalSize)}
              </span>
            </div>

            <ul className="flex flex-col divide-y divide-border">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`} className="flex items-center gap-4 px-5 py-4">
                  <FileKindIcon name={file.name} mime={file.type} className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {fileKindLabel(file.name, file.type)} · {formatBytes(file.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => removeFile(index)}
                  >
                    <X className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mx-auto mt-8 flex max-w-xl items-center gap-3">
            <Button
              variant="outline"
              onClick={openFilePicker}
              className="min-w-0 flex-1 px-5 sm:flex-none sm:px-7"
            >
              <Plus className="size-4" />
              More files
            </Button>
            <Button
              onClick={() => setStage("linking")}
              className="min-w-0 flex-1 px-5 sm:flex-none sm:px-7"
            >
              Send file
              <ArrowRight className="button-arrow size-4" />
            </Button>
          </div>
        </section>
      )}

      {stage === "linking" && (
        <LinkingStage
          message={message}
          isError={phase === "error"}
          onRetry={retryTransfer}
          onBack={() => setStage("review")}
        />
      )}

      {stage === "celebrate" && (
        <section className="py-20 text-center lg:py-28">
          <div className="mx-auto max-w-xl">
            {/* Keyed so the sound and confetti fire once on arrival rather than
                on every re-render while the peer stays connected. */}
            <SuccessTick key="celebrate" withSound withConfetti />

            <h1 className={`mx-auto mt-8 max-w-lg text-balance ${SECTION_HEADING}`}>Link ready</h1>

            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
              Send it to the other device, then leave this tab open while the files move across.
            </p>

            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button onClick={() => setStage("share")} className="w-full sm:w-auto">
                Share the link
                <ArrowRight className="button-arrow size-4" />
              </Button>
              <Button variant="outline" onClick={startOver} className="w-full sm:w-auto">
                Send another
              </Button>
            </div>
          </div>
        </section>
      )}

      {stage === "share" && (
        <ShareStage
          link={link}
          phase={phase}
          sent={sent}
          total={total}
          onBack={() => setStage("celebrate")}
          onStartOver={startOver}
        />
      )}
    </Shell>
  );
}

function LinkingStage({
  message,
  isError,
  onRetry,
  onBack,
}: {
  message: string;
  isError: boolean;
  onRetry: () => void;
  onBack: () => void;
}) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      {isError ? (
        <>
          <p className="eyebrow">Could not start</p>
          <p className="mx-auto mt-4 max-w-sm text-sm text-muted-foreground">
            {message || "The connection could not be set up."}
          </p>
          <div className="mt-8 flex items-center gap-3">
            <Button variant="outline" onClick={onBack}>
              Back to files
            </Button>
            <Button onClick={onRetry}>Try again</Button>
          </div>
        </>
      ) : (
        <>
          <p className="eyebrow">Creating your link</p>
          <div className="mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-muted">
            <div className="sending-shimmer relative h-full w-full overflow-hidden rounded-full bg-primary" />
          </div>
          <p className="mt-5 max-w-xs text-xs text-muted-foreground">
            {message || "This only takes a moment."}
          </p>
        </>
      )}
    </section>
  );
}

function ShareStage({
  link,
  phase,
  sent,
  total,
  onBack,
  onStartOver,
}: {
  link: string;
  phase: string;
  sent: number;
  total: number;
  onBack: () => void;
  onStartOver: () => void;
}) {
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
    <section className="py-16 text-center lg:py-24">
      <p className="eyebrow">Share the link</p>

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

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
              Back
            </Button>
            <Button variant="outline" onClick={onStartOver} className="w-full sm:w-auto">
              Send another
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TransferStatus({ phase, sent, total }: { phase: string; sent: number; total: number }) {
  const percent = total ? Math.min(100, (sent / total) * 100) : 0;

  // Progress only exists while bytes are moving. Once complete the bar and its
  // readout disappear rather than lingering on a finished transfer.
  if (phase !== "transferring") return null;

  return (
    <div className="mt-6">
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="sending-shimmer relative h-full overflow-hidden rounded-full bg-primary transition-[width] duration-200"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Sending {percent.toFixed(0)}% · {formatBytes(sent)} / {formatBytes(total)}
      </p>
    </div>
  );
}
