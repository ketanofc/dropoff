import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Plus, Share2, Upload, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Progress, Shell } from "../components/shell";
import { FileKindIcon, fileKindLabel } from "../components/file-icon";
import { IntroOverlay } from "../components/intro-overlay";
import { TextAnimate } from "../components/text-animate";
import { buildManifest, formatBytes, newTransferId, sendFiles } from "../lib/transfer";
import { canonical, jsonLd, ogUrl, SITE_URL } from "../lib/seo";
import illustrationAsset from "../assets/transfer-illustration.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "dropoff.lol – file sharing!" },
      {
        name: "description",
        content:
          "Send files peer to peer, right from your browser. No permanent uploads and no account required.",
      },
      { property: "og:title", content: "dropoff.lol – file sharing!" },
      { property: "og:description", content: "Send files peer to peer, right from your browser." },
      { property: "og:type", content: "website" },
      ogUrl("/"),
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [canonical("/")],
    scripts: [
      jsonLd({
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "@id": `${SITE_URL}/#application`,
        name: "dropoff.lol",
        url: `${SITE_URL}/`,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Browser",
        browserRequirements: "Requires JavaScript and WebRTC.",
        description:
          "Send files peer to peer, right from your browser. No permanent uploads and no account required.",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        isPartOf: { "@id": `${SITE_URL}/#website` },
      }),
    ],
  }),
  component: Index,
});

type Phase = "idle" | "preparing" | "waiting" | "transferring" | "complete" | "error";

function Index() {
  const inputRef = useRef<HTMLInputElement>(null);
  const peerRef = useRef<{ destroy: () => void } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [link, setLink] = useState("");
  const [sent, setSent] = useState(0);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => () => peerRef.current?.destroy(), []);

  function reset() {
    peerRef.current?.destroy();
    peerRef.current = null;
    setFiles([]);
    setPhase("idle");
    setLink("");
    setSent(0);
    setTotal(0);
    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function onFilesSelected(selected: FileList | null) {
    if (!selected || selected.length === 0) return;
    const selectedFiles = Array.from(selected);
    setFiles((prev) => [...prev, ...selectedFiles]);
  }

  function openFilePicker() {
    if (!inputRef.current) return;
    inputRef.current.value = "";
    inputRef.current.click();
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function startTransfer() {
    if (files.length === 0) return;
    setPhase("preparing");
    setMessage("Creating a secure browser connection…");
    try {
      const { default: Peer } = await import("peerjs");
      const id = newTransferId();
      const peer = new Peer(id);
      peerRef.current = peer;

      peer.on("open", () => {
        setLink(`${window.location.origin}/receive/${id}`);
        setPhase("waiting");
        setMessage("Waiting for the recipient to open your link…");
      });

      peer.on("error", (error) => {
        setPhase("error");
        setMessage(error.message || "The connection could not be set up.");
      });

      peer.on("connection", (conn) => {
        const sendManifest = async () => {
          const manifest = await buildManifest(files);
          conn.send({ kind: "manifest", files: manifest });
        };

        conn.on("open", async () => {
          setMessage("Recipient connected. Waiting for them to accept…");
          await sendManifest();
        });

        conn.on("data", async (data: unknown) => {
          const control = data as { kind?: string; hash?: string };
          if (control?.kind === "accept") {
            setPhase("transferring");
            setMessage("");
            setSent(0);
            setTotal(files.reduce((sum, f) => sum + f.size, 0));
            await sendFiles(conn, files, (s) => setSent(s));
            setPhase("complete");
          }
          if (control?.kind === "decline") {
            setPhase("error");
            setMessage("The recipient declined this transfer.");
          }
        });

        conn.on("close", () => {
          setPhase((current) => (current === "transferring" ? "error" : current));
        });
      });
    } catch (error) {
      setPhase("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  const percent = total ? (sent / total) * 100 : 0;

  return (
    <Shell>
      <IntroOverlay />
      <section className="pt-16 sm:pt-20 lg:pt-24">
        <div className="mx-auto w-full max-w-[720px] lg:grid lg:max-w-none lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center lg:gap-14">
          <div className="min-w-0">
            <TextAnimate
              animation="blurIn"
              as="h1"
              className="mx-auto mt-5 max-w-[640px] text-balance text-center font-serif text-[38px] font-normal leading-[1.06] tracking-normal sm:text-[46px] sm:leading-[1.04] lg:mx-0 lg:max-w-none lg:text-left lg:text-[56px] lg:leading-[1.03]"
            >
              Send files peer to peer, right from{" "}
              <span className="font-normal italic text-[#fd60a9]">your</span> browser
            </TextAnimate>
            <p className="mx-auto mt-6 max-w-[520px] text-balance text-center text-[15px] leading-6 text-muted-foreground lg:mx-0 lg:max-w-none lg:text-left lg:text-[17px] lg:leading-7">
              Send files straight from your browser. Nothing is permanently uploaded, and no account
              is required.
            </p>

          <input
            ref={inputRef}
            type="file"
            multiple
            className="sr-only"
            onChange={(event) => {
              onFilesSelected(event.target.files);
              event.target.value = "";
            }}
          />

          {files.length === 0 ? (
            <div className="mt-10 lg:mt-8 text-center">
              <Button
                type="button"
                className="h-14 w-auto max-w-[440px] rounded-full text-base inline-flex"
                onClick={openFilePicker}
              >
                <Upload className="size-4" />
                Select a file to share
              </Button>
              <img
                src={illustrationAsset.url}
                alt="Two people transferring files directly between their browsers"
                className="mx-auto mt-10 block h-auto w-full max-w-[380px] object-contain sm:max-w-[420px] lg:hidden"
              />
              <p className="mt-3 text-center text-xs text-muted-foreground lg:text-left">
                Selecting a file constitutes agreement to{" "}
                <a href="/terms" className="underline underline-offset-2 hover:text-foreground">
                  our terms
                </a>
              </p>
            </div>
          ) : (
            <div className="mt-10 min-w-0 space-y-5">
              <div className="grid w-full min-w-0 gap-3 md:grid-cols-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className={`flex min-h-16 min-w-0 items-center gap-3 rounded-xl bg-secondary p-3 ${
                      files.length === 1 ? "md:col-span-full" : ""
                    }`}
                  >
                    <FileKindIcon name={file.name} mime={file.type} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{file.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {fileKindLabel(file.name, file.type)} · {formatBytes(file.size)}
                        {phase === "idle" ? " · ready to share" : ""}
                      </p>
                    </div>
                    {phase === "idle" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 rounded-full"
                        aria-label="Remove file"
                        onClick={() => removeFile(index)}
                      >
                        <X className="size-5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {phase === "idle" && (
                <>
                  <Button
                    type="button"
                    variant="pink"
                    className="h-12 w-full rounded-full text-sm"
                    onClick={openFilePicker}
                  >
                    <Plus className="size-4" />
                    Add more files
                  </Button>
                  <Button className="h-14 w-full rounded-full text-base mt-1" onClick={startTransfer}>
                    Start transfer
                    {files.length > 1 && ` (${files.length} files, ${formatBytes(totalSize)})`}
                  </Button>
                </>
              )}

              {(phase === "preparing" || phase === "waiting") && (
                <div className="rounded-xl border border-border p-5 sm:p-6">
                  <div className="flex items-center gap-2.5 text-sm font-medium">
                    <span aria-hidden="true" className="relative flex size-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    Share this link
                  </div>
                  <p className="mt-2 text-[13px] leading-5 text-muted-foreground">{message}</p>
                  {link && (
                    <>
                      <div className="mt-4 flex min-w-0 items-start gap-4">
                        <div className="shrink-0 max-w-full rounded-lg bg-white p-2">
                          <QRCodeSVG
                            value={link}
                            size={120}
                            level="Q"
                            fgColor="#000000"
                            bgColor="#ffffff"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5">
                            <span className="min-w-0 flex-1 truncate text-[13px]">{link}</span>
                            <button
                              onClick={copyLink}
                              aria-label="Copy link"
                              className="shrink-0 rounded-full p-1 text-muted-foreground hover:text-foreground"
                            >
                              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                            </button>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Button variant="pink" className="min-w-0 flex-1 rounded-xl" onClick={copyLink}>
                              {copied ? "Copied" : "Copy"}
                            </Button>
                            {typeof navigator !== "undefined" && "share" in navigator && (
                              <Button className="min-w-0 flex-1 rounded-xl" onClick={() =>
                                navigator
                                  .share({ title: "dropoff.lol", url: link })
                                  .catch(() => {})
                              }>
                                <Share2 className="size-4" /> Share
                              </Button>
                            )}
                          </div>
                          <p className="mt-3 text-xs text-muted-foreground">
                            Leave this tab open, dropoff.lol does not store files.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {phase === "transferring" && (
                <div className="rounded-xl border border-border p-5 sm:p-6">
                  <p className="text-sm font-medium">Transferring…</p>
                  <Progress value={percent} />
                  <p className="mt-3 text-xs text-muted-foreground">
                    {percent.toFixed(0)}% · {formatBytes(sent)} / {formatBytes(total)}
                  </p>
                </div>
              )}

              {phase === "complete" && (
                <div className="rounded-xl border border-border p-5 sm:p-6">
                  <p className="text-sm font-medium">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />{" "}
                    Transfer complete
                  </p>
                  <p className="mt-2 text-[13px] text-muted-foreground">
                    {files.length === 1
                      ? "The file was delivered to the recipient."
                      : `All ${files.length} files were delivered to the recipient.`}
                  </p>
                  <Button className="mt-4 w-full rounded-full" onClick={reset}>
                    Send another file
                  </Button>
                </div>
              )}

              {phase === "error" && (
                <div className="rounded-xl border border-border p-5 sm:p-6">
                  <p className="text-sm font-medium">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" /> Transfer
                    stopped
                  </p>
                  <p className="mt-2 text-[13px] text-muted-foreground">
                    {message || "The connection was lost."}
                  </p>
                  <Button className="mt-4 w-full rounded-full" onClick={reset}>
                    Start over
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        {files.length === 0 && (
          <div className="hidden lg:block">
            <img
              src={illustrationAsset.url}
              alt="Two people transferring files directly between their browsers"
              className="mx-auto h-auto w-full max-w-[420px] object-contain"
            />
          </div>
        )}
      </div>
      </section>
    </Shell>
  );
}
