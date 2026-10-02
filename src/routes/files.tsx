import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Plus, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "../components/ui/button";
import { FileKindIcon, fileKindLabel } from "../components/file-icon";
import { Shell } from "../components/shell";
import { useTransfer } from "../lib/transfer-context";
import { formatBytes } from "../lib/transfer";

export const Route = createFileRoute("/files")({
  component: FilesPage,
});

function FilesPage() {
  const { files, addFiles, removeFile } = useTransfer();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  function openFilePicker() {
    if (!inputRef.current) return;
    inputRef.current.value = "";
    inputRef.current.click();
  }

  // Nothing selected means a direct visit or refresh, so send them back to
  // pick something rather than showing an empty card.
  useEffect(() => {
    if (files.length === 0) void navigate({ to: "/" });
  }, [files.length, navigate]);

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
          addFiles(picked);
        }}
      />

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

        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-muted-foreground">
          files move directly between browsers over WebRTC
        </p>

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
            onClick={() => void navigate({ to: "/sending" })}
            className="min-w-0 flex-1 px-5 sm:flex-none sm:px-7"
          >
            Send file
            <ArrowRight className="button-arrow size-4" />
          </Button>
        </div>
      </section>
    </Shell>
  );
}
