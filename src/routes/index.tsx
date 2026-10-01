import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Plus, Share2, Upload, X, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Progress, Shell } from "../components/shell";
import { FileKindIcon, fileKindLabel } from "../components/file-icon";
import { TextAnimate } from "../components/text-animate";
import { buildManifest, formatBytes, newTransferId, sendFiles } from "../lib/transfer";
import { canonical, jsonLd, ogUrl, SITE_URL } from "../lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "dropoff.lol – peer to peer file sharing" },
      {
        name: "description",
        content: "Send files peer to peer, right from your browser. No permanent uploads and no account required.",
      },
      { property: "og:title", content: "dropoff.lol – peer to peer file sharing" },
      { property: "og:description", content: "Send files peer to peer, right from your browser. No permanent uploads and no account required." },
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
        description: "Send files peer to peer, right from your browser. No permanent uploads and no account required.",
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

  return (
    <Shell>
      <main className="min-h-screen bg-background">
        <header className="border-b border-border/50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="text-lg font-medium tracking-tight">dropoff.lol</div>
            <nav className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            </nav>
          </div>
        </header>

        <section className="py-20 lg:py-32">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center lg:text-left max-w-3xl">
              <span className="inline-block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                01
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.02] mb-6">
                Send Files Right From Your Browser
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl">
                Peer to peer file transfers, no limits, no permanent uploads, and no account required.
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
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                  <Button
                    type="button"
                    className="h-12 w-full sm:w-auto rounded-lg text-base font-medium"
                    onClick={openFilePicker}
                  >
                    <Upload className="size-4 mr-2" />
                    Select a file to share
                  </Button>
                  <p className="text-center text-xs text-muted-foreground flex items-center justify-center">
                    Selecting a file constitutes agreement to{" "}
                    <a href="/terms" className="underline underline-offset-2 hover:text-foreground">
                      our terms
                    </a>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <Button
                      variant="outline"
                      className="h-10 px-4 rounded-lg text-sm"
                      onClick={openFilePicker}
                    >
                      <Plus className="size-4 mr-2" />
                      Add more files
                    </Button>
                    <Button className="h-12 px-6 rounded-lg text-base" onClick={startTransfer}>
                      Start transfer
                      {files.length > 1 && ` (${files.length} files, ${formatBytes(totalSize)})`}
                    </Button>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    Selecting a file constitutes agreement to{" "}
                    <a href="/terms" className="underline underline-offset-2 hover:text-foreground">
                      our terms
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {files.length > 0 && (
          <section className="py-16 lg:py-24 border-t border-border/50">
            <div className="max-w-4xl mx-auto px-6">
              <div className="mb-8">
                <span className="inline-block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  02
                </span>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight">
                  Files Ready to Share
                </h2>
              </div>

              <div className="space-y-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card hover:border-border/80 transition-colors"
                  >
                    <FileKindIcon name={file.name} mime={file.type} className="flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-sm">{file.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fileKindLabel(file.name, file.type)} · {formatBytes(file.size)}
                        {phase === "idle" && " · ready to share"}
                      </p>
                    </div>
                    {phase === "idle" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-full"
                        aria-label="Remove file"
                        onClick={() => removeFile(index)}
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {phase === "idle" && (
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    className="h-10 px-4 rounded-lg text-sm"
                    onClick={openFilePicker}
                  >
                    <Plus className="size-4 mr-2" />
                    Add more files
                  </Button>
                  <Button className="h-12 px-6 rounded-lg text-base" onClick={startTransfer}>
                    Start transfer
                    {files.length > 1 && ` (${files.length} files, ${formatBytes(totalSize)})`}
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {(phase === "preparing" || phase === "waiting") && link && (
          <section className="py-16 lg:py-24 border-t border-border/50">
            <div className="max-w-4xl mx-auto px-6">
              <div className="mb-8">
                <span className="inline-block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  03
                </span>
                <h2 className="text-2xl sm:text-3xl font-light tracking-tight">
                  Share the Link
                </h2>
              </div>

              <div className="space-y-6">
                <div className="rounded-lg border border-border/50 p-6">
                  <div className="flex items-center gap-3 text-sm font-medium mb-4">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                    </span>
                    Share this link
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{message}</p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="shrink-0 max-w-full rounded-lg bg-muted p-3">
                      <QRCodeSVG
                        value={link}
                        size={100}
                        level="Q"
                        fgColor="#000000"
                        bgColor="#ffffff"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-4 py-3">
                        <span className="min-w-0 flex-1 truncate text-sm font-mono">{link}</span>
                        <button
                          onClick={copyLink}
                          aria-label="Copy link"
                          className="shrink-0 rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-border/50 transition-colors"
                        >
                          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button className="flex-1 min-w-[140px] rounded-lg" onClick={copyLink}>
                          {copied ? "Copied" : "Copy"}
                        </Button>
                        {typeof navigator !== "undefined" && "share" in navigator && (
                          <Button variant="outline" className="flex-1 min-w-[140px] rounded-lg" onClick={() =>
                            navigator
                              .share({ title: "dropoff.lol", url: link })
                              .catch(() => {})
                          }>
                            <Share2 className="size-4 mr-2" />
                            Share
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Leave this tab open, dropoff.lol does not store files.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {(phase === "transferring" || phase === "complete" || phase === "error") && (
          <section className="py-16 lg:py-24 border-t border-border/50">
            <div className="max-w-4xl mx-auto px-6">
              <div className="space-y-6">
                {phase === "transferring" && (
                  <div className="rounded-lg border border-border/50 p-6">
                    <p className="text-sm font-medium mb-4">Transferring…</p>
                    <Progress value={percent} className="h-2" />
                    <p className="mt-3 text-xs text-muted-foreground">
                      {percent.toFixed(0)}% · {formatBytes(sent)} / {formatBytes(total)}
                    </p>
                  </div>
                )}

                {phase === "complete" && (
                  <div className="rounded-lg border border-border/50 p-6">
                    <div className="flex items-center gap-2 text-sm font-medium mb-4">
                      <span className="inline-block size-1.5 rounded-full bg-emerald-500" />
                      Transfer complete
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      {files.length === 1
                        ? "The file was delivered to the recipient."
                        : `All ${files.length} files were delivered to the recipient.`}
                    </p>
                    <Button className="w-full sm:w-auto rounded-lg" onClick={reset}>
                      Send another file
                    </Button>
                  </div>
                )}

                {phase === "error" && (
                  <div className="rounded-lg border border-border/50 p-6">
                    <div className="flex items-center gap-2 text-sm font-medium mb-4">
                      <span className="inline-block size-1.5 rounded-full bg-red-500" />
                      Transfer stopped
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      {message || "The connection was lost."}
                    </p>
                    <Button className="w-full sm:w-auto rounded-lg" onClick={reset}>
                      Start over
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <footer className="border-t border-border/50 py-16 lg:py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              <div>
                <h4 className="text-sm font-medium tracking-tight mb-4">dropoff.lol</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Peer to peer file sharing. No permanent uploads, no account required.
                </p>
              </div>
              <nav>
                <h4 className="text-sm font-medium tracking-tight mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="/terms" className="hover:text-foreground transition-colors">Terms</a></li>
                </ul>
              </nav>
              <nav>
                <h4 className="text-sm font-medium tracking-tight mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="/terms" className="hover:text-foreground transition-colors">Terms</a></li>
                  <li><a href="/terms" className="hover:text-foreground transition-colors">Privacy</a></li>
                  <li><a href="/terms" className="hover:text-foreground transition-colors">Security</a></li>
                </ul>
              </nav>
              <nav>
                <h4 className="text-sm font-medium tracking-tight mb-4">Connect</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="https://github.com/ketanofc/dropoff" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-2">
                    GitHub
                    <ArrowRight className="size-3" />
                  </a></li>
                </ul>
              </nav>
            </div>
            <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-xs text-muted-foreground">
                © 2026 dropoff.lol. Peer to peer file sharing.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </Shell>
  );
}