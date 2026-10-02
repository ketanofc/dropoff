import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { DataConnection } from "peerjs";
import { buildManifest, newTransferId, sendFiles } from "./transfer";

export type Phase = "idle" | "preparing" | "waiting" | "transferring" | "complete" | "error";

type TransferState = {
  files: File[];
  phase: Phase;
  link: string;
  sent: number;
  total: number;
  message: string;
};

type TransferActions = {
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  startTransfer: () => Promise<void>;
  retryTransfer: () => void;
  reset: () => void;
};

const TransferContext = createContext<(TransferState & TransferActions) | null>(null);

/** How long to wait for the peer to register before giving up. */
const PEER_OPEN_TIMEOUT_MS = 20000;

const ICE_SERVERS = [
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
];

export function TransferProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [link, setLink] = useState("");
  const [sent, setSent] = useState(0);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");

  // The peer must outlive any single route, so it lives here rather than in a page.
  const peerRef = useRef<{ destroy: () => void } | null>(null);
  const filesRef = useRef<File[]>([]);

  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => () => peerRef.current?.destroy(), []);

  const addFiles = useCallback((incoming: File[]) => {
    if (incoming.length === 0) return;
    setFiles((prev) => [...prev, ...incoming]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const reset = useCallback(() => {
    peerRef.current?.destroy();
    peerRef.current = null;
    setFiles([]);
    setPhase("idle");
    setLink("");
    setSent(0);
    setTotal(0);
    setMessage("");
  }, []);

  /**
   * Restarts the peer without discarding the selected files. Used by the
   * retry button, which needs phase back at "idle" so the sending page
   * re-triggers startTransfer.
   */
  const retryTransfer = useCallback(() => {
    peerRef.current?.destroy();
    peerRef.current = null;
    setPhase("idle");
    setLink("");
    setSent(0);
    setMessage("");
  }, []);

  const startTransfer = useCallback(async () => {
    if (filesRef.current.length === 0) return;
    setPhase("preparing");
    setMessage("Creating a secure browser connection…");
    setSent(0);
    setTotal(filesRef.current.reduce((sum, f) => sum + f.size, 0));

    try {
      const { default: Peer } = await import("peerjs");
      const id = newTransferId();
      const peer = new Peer(id, {
        config: { iceServers: ICE_SERVERS, iceCandidatePoolSize: 10 },
      });
      peerRef.current = peer;

      // PeerJS registers against the public 0.peerjs.com signaling server,
      // which is often rate-limited or unreachable. Without a deadline the
      // "open" event may never fire and the UI would wait on it forever.
      const openTimeout = window.setTimeout(() => {
        if (peerRef.current !== peer) return;
        peer.destroy();
        peerRef.current = null;
        setPhase("error");
        setMessage("Could not reach the signaling server. Please try again.");
      }, PEER_OPEN_TIMEOUT_MS);

      peer.on("open", () => {
        window.clearTimeout(openTimeout);
        setLink(`${window.location.origin}/receive/${id}`);
        setPhase("waiting");
        setMessage("Waiting for the recipient to open your link…");
      });

      peer.on("error", (error: Error) => {
        window.clearTimeout(openTimeout);
        setPhase("error");
        setMessage(error.message || "The connection could not be set up.");
      });

      peer.on("connection", (conn: DataConnection) => {
        conn.on("open", async () => {
          setMessage("Recipient connected. Waiting for them to accept…");
          conn.send({ kind: "manifest", files: await buildManifest(filesRef.current) });
        });

        conn.on("data", async (data: unknown) => {
          const control = data as { kind?: string };
          if (control?.kind === "accept") {
            setPhase("transferring");
            setMessage("");
            setSent(0);
            setTotal(filesRef.current.reduce((sum, f) => sum + f.size, 0));
            await sendFiles(conn, filesRef.current, setSent);
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
  }, []);

  const value = useMemo(
    () => ({
      files,
      phase,
      link,
      sent,
      total,
      message,
      addFiles,
      removeFile,
      startTransfer,
      retryTransfer,
      reset,
    }),
    [
      files,
      phase,
      link,
      sent,
      total,
      message,
      addFiles,
      removeFile,
      startTransfer,
      retryTransfer,
      reset,
    ],
  );

  return <TransferContext.Provider value={value}>{children}</TransferContext.Provider>;
}

export function useTransfer() {
  const ctx = useContext(TransferContext);
  if (!ctx) throw new Error("useTransfer must be used inside TransferProvider");
  return ctx;
}
