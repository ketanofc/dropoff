// ============= Full file contents =============

export const CHUNK_SIZE = 64 * 1024;
export const BUFFER_LIMIT = 8 * 1024 * 1024;

export type FileMeta = {
  name: string;
  size: number;
  mime: string;
  /** Small data-URL thumbnail for images. */
  preview?: string;
  /** First few lines of a text-like file. */
  previewText?: string;
};

const PREVIEW_MAX = 320;
const TEXT_PREVIEW_BYTES = 2048;

function isTextLike(file: File) {
  if (file.type.startsWith("text/")) return true;
  return /^(application\/(json|xml|javascript|x-yaml)|text\/)/.test(file.type) || /\.(txt|md|csv|json|log|ya?ml|xml|ts|tsx|js|jsx|css|html)$/i.test(file.name);
}

async function imageThumbnail(file: File): Promise<string | undefined> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, PREVIEW_MAX / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch {
    return undefined;
  }
}

/** Builds a lightweight preview so the recipient can see what is coming before accepting. */
export async function buildFileMeta(file: File): Promise<FileMeta> {
  const meta: FileMeta = { name: file.name, size: file.size, mime: file.type };
  if (file.type.startsWith("image/")) {
    const preview = await imageThumbnail(file);
    if (preview) meta.preview = preview;
  } else if (isTextLike(file) && file.size > 0) {
    try {
      const text = await file.slice(0, TEXT_PREVIEW_BYTES).text();
      meta.previewText = text.split("\n").slice(0, 12).join("\n");
    } catch {
      /* ignore */
    }
  }
  return meta;
}

export async function buildManifest(files: File[]): Promise<FileMeta[]> {
  return Promise.all(files.map(buildFileMeta));
}
export type Manifest = { kind: "manifest"; files: FileMeta[] };
export type FileStart = { kind: "file-start"; index: number };
export type FileDone = { kind: "file-done"; index: number };
export type Accept = { kind: "accept" };
export type Decline = { kind: "decline" };
export type AllDone = { kind: "done" };
export type Control =
  | Manifest
  | FileStart
  | FileDone
  | Accept
  | Decline
  | AllDone;

export type FileKind = "image" | "video" | "audio" | "document" | "archive" | "file";

const EXT_KINDS: Array<[RegExp, FileKind]> = [
  [/\.(jpe?g|png|gif|webp|avif|bmp|svg|heic|heif|tiff?|ico)$/i, "image"],
  [/\.(mp4|mov|m4v|webm|avi|mkv|flv|wmv|mpe?g|3gp)$/i, "video"],
  [/\.(mp3|wav|ogg|oga|m4a|aac|flac|wma|opus|aiff?)$/i, "audio"],
  [/\.(pdf|docx?|xlsx?|pptx?|odt|ods|odp|rtf|txt|md|csv|json|xml|ya?ml|log|html?|css|js|jsx|ts|tsx|epub)$/i, "document"],
  [/\.(zip|rar|7z|tar|gz|tgz|bz2|xz|iso|dmg)$/i, "archive"],
];

/** Picks the visual category for a file so the UI can show a matching icon. */
export function fileKind(name: string, mime = ""): FileKind {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (/^(application\/(zip|x-7z|x-rar|x-tar|gzip|x-bzip)|application\/x-compressed)/.test(mime)) return "archive";
  if (
    mime.startsWith("text/") ||
    /^application\/(pdf|json|xml|rtf|msword|vnd\.(ms-|openxmlformats))/.test(mime)
  )
    return "document";
  for (const [pattern, kind] of EXT_KINDS) {
    if (pattern.test(name)) return kind;
  }
  return "file";
}


export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

export function newTransferId() {
  return `dropoff-${Math.random().toString(36).slice(2, 10)}`;
}

export function toArrayBuffer(data: unknown): ArrayBuffer | null {
  if (data instanceof ArrayBuffer) return data;
  if (data instanceof Uint8Array) {
    return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
  }
  return null;
}

export async function sendFiles(
  conn: { send: (data: unknown) => void; dataChannel?: RTCDataChannel },
  files: File[],
  onProgress: (sent: number) => void,
) {
  let sent = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    conn.send({ kind: "file-start", index: i });
    let offset = 0;
    while (offset < file.size) {
      const buffer = await file.slice(offset, offset + CHUNK_SIZE).arrayBuffer();
      conn.send(buffer);
      offset += buffer.byteLength;
      sent += buffer.byteLength;
      onProgress(sent);
      const channel = conn.dataChannel;
      while (channel && channel.bufferedAmount > BUFFER_LIMIT) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    }
    conn.send({ kind: "file-done", index: i });
  }
  conn.send({ kind: "done" });
}
