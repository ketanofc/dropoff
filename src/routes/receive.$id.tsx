import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Shell } from "../components/shell";
import { FileKindIcon, fileKindLabel } from "../components/file-icon";
import { formatBytes, toArrayBuffer, type Control, type FileMeta } from "../lib/transfer";
import { SITE_URL } from "../lib/seo";

export const Route = createFileRoute("/receive/$id")({
  head: (ctx) => {
    const url = `${SITE_URL}/receive/${ctx.params.id}`;
    return {
      meta: [
        { title: "Someone is sending you a file – dropoff.lol" },
        {
          name: "description",
          content: "Receive a file sent directly from another browser with dropoff.lol.",
        },
        { name: "robots", content: "noindex, nofollow" },
        { property: "og:title", content: "Someone is sending you a file – dropoff.lol" },
        {
          property: "og:description",
          content: "Receive a file sent directly from another browser.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: Receive,
});

type Phase = "connecting" | "offer" | "receiving" | "done" | "error";

function Receive() {
  const { id } = Route.useParams();
  const connRef = useRef<{ send: (data: unknown) => void } | null>(null);
  const peerRef = useRef<{ destroy: () => void } | null>(null);
  const fileChunksRef = useRef<Map<number, ArrayBuffer[]>>(new Map());
  const manifestRef = useRef<FileMeta[]>([]);
  const currentFileRef = useRef<number>(-1);
  const [phase, setPhase] = useState<Phase>("connecting");
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [received, setReceived] = useState(0);
  const [total, setTotal] = useState(0);
  const [urls, setUrls] = useState<string[]>([]);
  const [message, setMessage] = useState("Connecting to the sender…");

  useEffect(() => {
    let cancelled = false;
    const slow = setTimeout(() => {
      if (!cancelled) {
        setMessage((current) =>
          current.startsWith("Connecting") || current.startsWith("Connected")
            ? "Still trying to reach the sender. Make sure they still have their dropoff.lol tab open."
            : current,
        );
      }
    }, 20000);

    (async () => {
      try {
        const { default: Peer } = await import("peerjs");
        const peer = new Peer({
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

        peer.on("error", (error) => {
          if (cancelled) return;
          setPhase("error");
          setMessage(error.message || "This transfer link is no longer active.");
        });

        peer.on("open", () => {
          const conn = peer.connect(id, { reliable: true });
          connRef.current = conn;

          conn.on("open", () => setMessage("Connected. Waiting for file details…"));

          conn.on("data", (data: unknown) => {
            const buffer = toArrayBuffer(data);
            if (buffer) {
              const cur = currentFileRef.current;
              if (cur >= 0) {
                const arr = fileChunksRef.current.get(cur) ?? [];
                arr.push(buffer);
                fileChunksRef.current.set(cur, arr);
                setReceived((value) => value + buffer.byteLength);
              }
              return;
            }
            const control = data as Control;
            if (control?.kind === "manifest") {
              manifestRef.current = control.files;
              setFiles(control.files);
              setTotal(control.files.reduce((s, f) => s + f.size, 0));
              setPhase("offer");
            }
            if (control?.kind === "file-start") {
              currentFileRef.current = control.index;
              fileChunksRef.current.set(control.index, []);
            }
            if (control?.kind === "file-done") {
              const cur = control.index;
              const meta = manifestRef.current[cur];
              const chunks = fileChunksRef.current.get(cur) ?? [];
              const blob = new Blob(chunks, { type: meta?.mime || "application/octet-stream" });
              setUrls((prev) => {
                const next = [...prev];
                next[cur] = URL.createObjectURL(blob);
                return next;
              });
              currentFileRef.current = -1;
            }
            if (control?.kind === "done") {
              setPhase("done");
            }
          });

          conn.on("close", () => {
            setPhase((current) => (current === "receiving" ? "error" : current));
          });
        });
      } catch (error) {
        setPhase("error");
        setMessage(error instanceof Error ? error.message : "Something went wrong.");
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(slow);
      peerRef.current?.destroy();
    };
  }, [id]);

  const percent = total ? (received / total) * 100 : 0;
  const totalSize = files.reduce((s, f) => s + f.size, 0);
  const multiple = files.length > 1;

  return (
    <Shell>
      <section className="py-14 text-center lg:py-20">
        <p className="eyebrow">
          {phase === "done" ? "Received" : phase === "error" ? "Unavailable" : "Incoming"}
        </p>

        {/* One card carries the whole state, so the page reads as a single
            object rather than a stack of unrelated banners. */}
        <div className="mx-auto mt-8 max-w-xl overflow-hidden rounded-2xl border border-border bg-card text-left">
          {(phase === "connecting" || phase === "error") && (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          )}

          {phase === "offer" && (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {multiple
                  ? `${files.length} files · ${formatBytes(totalSize)}, straight from the sender's browser.`
                  : `${formatBytes(totalSize)}, straight from the sender's browser.`}
              </p>
              <div className="mt-8 flex items-center gap-3">
                <Button
                  onClick={() => {
                    connRef.current?.send({ kind: "accept" });
                    setPhase("receiving");
                  }}
                  className="min-w-0 flex-1"
                >
                  Accept &amp; download
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    connRef.current?.send({ kind: "decline" });
                    setPhase("error");
                    setMessage("You declined this transfer.");
                  }}
                  className="min-w-0 flex-1"
                >
                  Decline
                </Button>
              </div>
            </div>
          )}

          {phase === "receiving" && (
            <div className="px-6 py-10">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium">Receiving</span>
                <span className="text-xs text-muted-foreground">{percent.toFixed(0)}%</span>
              </div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="sending-shimmer relative h-full overflow-hidden rounded-full bg-primary transition-[width] duration-200"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {formatBytes(received)} / {formatBytes(total || totalSize)}
              </p>
            </div>
          )}

          {files.length > 0 && (
            <ul className="flex flex-col divide-y divide-border">
              {files.map((file, index) => {
                const ready = phase === "done" && Boolean(urls[index]);
                return (
                  <li key={index} className="flex items-center gap-4 px-5 py-4">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={`Preview of ${file.name}`}
                        className="size-9 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <FileKindIcon name={file.name} mime={file.mime} className="shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {fileKindLabel(file.name, file.mime)} · {formatBytes(file.size)}
                        {ready ? " · ready to save" : ""}
                      </p>
                    </div>

                    {ready && (
                      <a
                        href={urls[index]}
                        download={file.name}
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-label={`Save ${file.name}`}
                      >
                        <Download className="size-4" />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mx-auto mt-8 flex max-w-xl items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.location.assign("/")}
            className="w-full sm:w-auto"
          >
            Send a file instead
          </Button>
        </div>
      </section>
    </Shell>
  );
}
