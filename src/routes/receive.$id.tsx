import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Progress, Shell } from "../components/shell";
import { FileKindIcon, fileKindLabel } from "../components/file-icon";
import { TextAnimate } from "../components/text-animate";
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
        const peer = new Peer();
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
      <section className="pt-16 sm:pt-20 lg:pt-24">
        <div className="mx-auto w-full max-w-[720px]">
          <TextAnimate
            animation="blurIn"
            as="h1"
            className="mx-auto mt-5 max-w-[680px] text-balance text-center font-serif text-[38px] font-normal leading-[1.06] tracking-normal sm:text-[48px] sm:leading-[1.05] lg:text-[60px] lg:leading-[1.04]"
          >
            {phase === "done" ? (
              multiple ? (
                "Your files are ready"
              ) : (
                "Your file is ready"
              )
            ) : multiple ? (
              <>
                Someone is sending <span className="font-normal italic text-[#fd60a9]">you</span>{" "}
                files from their browser
              </>
            ) : (
              <>
                Someone is sending <span className="font-normal italic text-[#fd60a9]">you</span> a
                file from their browser
              </>
            )}
          </TextAnimate>

          {(phase === "connecting" || phase === "error") && (
            <p className="mx-auto mt-7 max-w-[520px] text-balance text-center text-[15px] leading-6 text-muted-foreground">
              {message}
            </p>
          )}

          {phase === "offer" && (
            <>
              <p className="mx-auto mt-7 max-w-[520px] text-balance text-center text-[15px] leading-6 text-muted-foreground">
                {multiple
                  ? `You're about to receive ${files.length} files (${formatBytes(totalSize)}) directly from the sender's browser.`
                  : `You're about to receive ${formatBytes(totalSize)} directly from the sender's browser.`}
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                <Button
                  className="h-14 flex-1 rounded-full text-base"
                  onClick={() => {
                    connRef.current?.send({ kind: "accept" });
                    setPhase("receiving");
                  }}
                >
                  Accept & download
                </Button>
                <Button
                  variant="outline"
                  className="h-14 flex-1 rounded-full text-base"
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
            <div className="mt-7 rounded-xl border border-border p-5 sm:p-6">
              <p className="text-sm font-medium">Receiving…</p>
              <Progress value={percent} />
              <p className="mt-3 text-xs text-muted-foreground">
                {percent.toFixed(0)}% · {formatBytes(received)} / {formatBytes(total || totalSize)}
              </p>
            </div>
          )}

          {phase === "done" && (
            <Button
              variant="outline"
              className="mt-7 w-full rounded-full sm:mt-8"
              onClick={() => window.location.assign("/")}
            >
              Send a file instead
            </Button>
          )}

          {phase === "error" && (
            <Button
              variant="outline"
              className="mt-7 w-full rounded-full sm:mt-8"
              onClick={() => window.location.assign("/")}
            >
              Send a file instead
            </Button>
          )}
        </div>

        {files.length > 0 && (
          <div className="mx-auto mt-10 grid w-full max-w-[720px] min-w-0 gap-3 md:grid-cols-2">
            {files.map((file, index) => (
              <div
                key={index}
                className={`min-w-0 overflow-hidden rounded-xl bg-secondary p-3 ${files.length === 1 ? "md:col-span-full" : ""}`}
              >
                <div className="flex min-h-16 items-center gap-3">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={`Preview of ${file.name}`}
                      className="size-12 shrink-0 rounded-md object-cover md:size-14"
                    />
                  ) : (
                    <FileKindIcon name={file.name} mime={file.mime} className="md:size-14" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{file.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {fileKindLabel(file.name, file.mime)} · {formatBytes(file.size)}
                      {phase === "done" && urls[index] ? " · ready to save" : ""}
                    </p>
                  </div>

                  {phase === "done" && urls[index] && (
                    <a
                      href={urls[index]}
                      download={file.name}
                      className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                      aria-label={`Save ${file.name}`}
                    >
                      <Download className="size-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Shell>
  );
}
