import { Archive, File, FileText, Image as ImageIcon, Music, Video } from "lucide-react";
import { fileKind, type FileKind } from "../lib/transfer";

const ICONS: Record<FileKind, typeof File> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
  archive: Archive,
  file: File,
};

const LABELS: Record<FileKind, string> = {
  image: "Image",
  video: "Video",
  audio: "Audio",
  document: "Document",
  archive: "Archive",
  file: "File",
};

export function fileKindLabel(name: string, mime?: string) {
  return LABELS[fileKind(name, mime)];
}

/** Square tile showing an icon that matches the kind of file. */
export function FileKindIcon({ name, mime, className = "" }: { name: string; mime?: string; className?: string }) {
  const kind = fileKind(name, mime);
  const Icon = ICONS[kind];
  return (
    <div
      className={`flex size-12 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground ${className}`}
      aria-label={LABELS[kind]}
      title={LABELS[kind]}
    >
      <Icon className="size-5" />
    </div>
  );
}
