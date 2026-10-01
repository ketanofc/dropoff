import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { HERO_HEADING, Progress, SECTION_HEADING, Shell } from "../components/shell";
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
      <section className="py-20 text-center lg:py-28">
        <h1 className={`mx-auto max-w-3xl text-balance ${HERO_HEADING}`}>
          {phase === "done"
            ? multiple
              ? "Your files are ready"
              : "Your file is ready"
            : multiple
              ? "Someone is sending you files"
              : "Someone is sending you a file"}
        </h1>

        {(phase === "connecting" || phase === "error") && (
          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground">
            {message}
          </p>
        )}

        {phase === "offer" && (
          <>
            <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground">
              {multiple
                ? `You're about to receive ${files.length} files (${formatBytes(totalSize)}) directly from the sender's browser.`
                : `You're about to receive ${formatBytes(totalSize)} directly from the sender's browser.`}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button
                onClick={() => {
                  connRef.current?.send({ kind: "accept" });
                  setPhase("receiving");
                }}
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
              >
                Decline
              </Button>
            </div>
          </>
        )}

        {phase === "receiving" && (
          <div className="mx-auto mt-10 max-w-xl rounded-3xl border border-border bg-card px-6 py-8">
            <h2 className={`mx-auto max-w-2xl text-balance ${SECTION_HEADING}`}>Receiving</h2>
            <Progress value={percent} />
            <p className="mt-4 text-xs text-muted-foreground">
              {percent.toFixed(0)}% · {formatBytes(received)} / {formatBytes(total || totalSize)}
            </p>
          </div>
        )}

        {phase === "done" && (
          <div className="mt-10 flex justify-center">
            <Button onClick={() => window.location.assign("/")}>Send a file instead</Button>
          </div>
        )}

        {phase === "error" && (
          <div className="mt-10 flex justify-center">
            <Button onClick={() => window.location.assign("/")}>Send a file instead</Button>
          </div>
        )}
      </section>

      {files.length > 0 && (
        <section className="border-t border-border py-16">
          <h2 className={`mx-auto max-w-2xl text-balance text-center ${SECTION_HEADING}`}>
            {phase === "done" ? "Ready to save" : "Incoming files"}
          </h2>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {multiple ? `${files.length} files` : "1 file"} · {formatBytes(totalSize)}
          </p>

          <ul className="mx-auto mt-8 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
            {files.map((file, index) => (
              <li
                key={index}
                className={`min-w-0 rounded-2xl border border-border bg-card p-4 ${files.length === 1 ? "sm:col-span-full" : ""}`}
              >
                <div className="flex min-w-0 items-center gap-4 text-left">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={`Preview of ${file.name}`}
                      className="size-12 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <FileKindIcon name={file.name} mime={file.mime} className="shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {fileKindLabel(file.name, file.mime)} · {formatBytes(file.size)}
                      {phase === "done" && urls[index] ? " · ready to save" : ""}
                    </p>
                  </div>

                  {phase === "done" && urls[index] && (
                    <a
                      href={urls[index]}
                      download={file.name}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      aria-label={`Save ${file.name}`}
                    >
                      <Download className="size-4" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Shell>
  );
}
