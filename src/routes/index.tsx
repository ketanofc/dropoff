import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Plus, Share2, Upload, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { HERO_HEADING, Progress, SECTION_HEADING, Shell } from "../components/shell";
import { FileKindIcon, fileKindLabel } from "../components/file-icon";
import { buildManifest, formatBytes, newTransferId, sendFiles } from "../lib/transfer";
import { canonical, jsonLd, ogUrl, SITE_URL } from "../lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "dropoff.lol – peer to peer file sharing" },
      {
        name: "description",
        content:
          "Send files peer to peer, right from your browser. No permanent uploads and no account required.",
      },
      { property: "og:title", content: "dropoff.lol – peer to peer file sharing" },
      {
        property: "og:description",
        content:
          "Send files peer to peer, right from your browser. No permanent uploads and no account required.",
      },
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
    setCopied(false);
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
      const peer = new Peer(id, {
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
            { urls: "stun:stun2.l.google.com:19302" },
            { urls: "stun:stun3.l.google.com:19302" },
            { urls: "stun:stun4.l.google.com:19302" },
            {
              urls: "turn:openrelay.metered.ca:80",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
            {
              urls: "turn:openrelay.metered.ca:443",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
            {
              urls: "turn:openrelay.metered.ca:443?transport=tcp",
              username: "openrelayproject",
              credential: "openrelayproject",
            },
          ],
          iceCandidatePoolSize: 10,
        },
      });
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
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <Shell>
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

      {files.length === 0 && (
        <section className="py-20 text-center lg:py-28">
          <h1 className={`mx-auto max-w-3xl text-balance ${HERO_HEADING}`}>
            Send Files Right From Your Browser
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            Peer to peer file transfers, no limits, no permanent uploads, and no account required.
          </p>
          <div className="mt-10 flex justify-center">
            <Button type="button" onClick={openFilePicker}>
              <Upload className="size-4" />
              Select a file to share
            </Button>
          </div>
        </section>
      )}

      {files.length > 0 && (
        <section className="py-20 text-center lg:py-28">
          <h2 className={`mx-auto max-w-2xl text-balance ${SECTION_HEADING}`}>
            Files Ready to Share
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            {files.length === 1 ? "1 file" : `${files.length} files`} · {formatBytes(totalSize)}
          </p>

          <ul className="mx-auto mt-8 flex max-w-xl flex-col gap-3 text-left">
            {files.map((file, index) => (
              <li
                key={index}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
              >
                <FileKindIcon name={file.name} mime={file.type} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {fileKindLabel(file.name, file.type)} · {formatBytes(file.size)}
                    {phase === "idle" && " · ready to share"}
                  </p>
                </div>
                {phase === "idle" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9 shrink-0"
                    aria-label={`Remove ${file.name}`}
                    onClick={() => removeFile(index)}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>

          {phase === "idle" && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button variant="outline" size="sm" onClick={openFilePicker}>
                <Plus className="size-4" />
                Add more files
              </Button>
              <Button onClick={startTransfer}>Start transfer</Button>
            </div>
          )}
        </section>
      )}

      {(phase === "preparing" || phase === "waiting") && (
        <section className="border-t border-border py-16 text-center lg:py-20">
          <h2 className={`mx-auto max-w-2xl text-balance ${SECTION_HEADING}`}>Share the Link</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">{message}</p>

          {link ? (
            <div className="mx-auto mt-8 flex max-w-xl flex-col items-center gap-6 rounded-3xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:gap-7">
              <div className="flex w-full shrink-0 justify-center sm:w-auto">
                <QRCodeSVG
                  value={link}
                  size={132}
                  level="Q"
                  fgColor="#000000"
                  bgColor="#ffffff"
                  className="h-auto w-full max-w-[132px] rounded-2xl"
                />
              </div>

              <div className="min-w-0 flex-1 text-center sm:text-left">
                <p className="break-all font-mono text-xs leading-relaxed text-muted-foreground">
                  {link}
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                  <Button onClick={copyLink}>
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {copied ? "Copied" : "Copy link"}
                  </Button>
                  {canShare && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigator.share({ title: "dropoff.lol", url: link }).catch(() => {})
                      }
                    >
                      <Share2 className="size-4" />
                      Share
                    </Button>
                  )}
                </div>

                <p className="mt-5 text-xs text-muted-foreground">
                  Leave this tab open, dropoff.lol does not store files.
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-border bg-card px-6 py-14">
              <span className="relative mx-auto flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-20" />
                <span className="relative inline-flex size-2 rounded-full bg-foreground" />
              </span>
              <p className="mt-4 text-sm text-muted-foreground">Preparing your link…</p>
            </div>
          )}
        </section>
      )}

      {phase === "transferring" && (
        <section className="border-t border-border py-16 text-center lg:py-20">
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card px-6 py-8">
            <h2 className={`mx-auto max-w-2xl text-balance ${SECTION_HEADING}`}>Transferring</h2>
            <Progress value={percent} />
            <p className="mt-4 text-xs text-muted-foreground">
              {percent.toFixed(0)}% · {formatBytes(sent)} / {formatBytes(total)}
            </p>
          </div>
        </section>
      )}

      {phase === "complete" && (
        <section className="border-t border-border py-16 text-center lg:py-20">
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card px-6 py-10">
            <h2 className={`mx-auto max-w-2xl text-balance ${SECTION_HEADING}`}>
              Transfer complete
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              {files.length === 1
                ? "The file was delivered to the recipient."
                : `All ${files.length} files were delivered to the recipient.`}
            </p>
            <div className="mt-8 flex justify-center">
              <Button onClick={reset}>Send another file</Button>
            </div>
          </div>
        </section>
      )}

      {phase === "error" && (
        <section className="border-t border-border py-16 text-center lg:py-20">
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card px-6 py-10">
            <h2 className={`mx-auto max-w-2xl text-balance ${SECTION_HEADING}`}>
              Transfer stopped
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
              {message || "The connection was lost."}
            </p>
            <div className="mt-8 flex justify-center">
              <Button onClick={reset}>Start over</Button>
            </div>
          </div>
        </section>
      )}
    </Shell>
  );
}
