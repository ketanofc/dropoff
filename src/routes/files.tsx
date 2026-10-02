import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Plus, ShieldCheck, X } from "lucide-react";
import { useRef } from "react";
import { Button } from "../components/ui/button";
import { FileKindIcon, fileKindLabel } from "../components/file-icon";
import { SECTION_HEADING, Shell } from "../components/shell";
import { useTransfer } from "../lib/transfer-context";
import { formatBytes } from "../lib/transfer";

export const Route = createFileRoute("/files")({
  component: FilesPage,
});

function FilesPage() {
  const { files, addFiles, removeFile, startTransfer } = useTransfer();
  const inputRef = useRef<HTMLInputElement>(null);
  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  function openFilePicker() {
    if (!inputRef.current) return;
    inputRef.current.value = "";
    inputRef.current.click();
  }

  return (
    <Shell>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      <section className="py-14 lg:py-20">
        <header className="mx-auto max-w-xl text-center">
          <p className="eyebrow">Step 1 of 3</p>
          <h1 className={`mx-auto mt-3 max-w-2xl text-balance ${SECTION_HEADING}`}>
            Review your files
          </h1>
          <p className="mx-auto mt-3 text-sm text-muted-foreground">
            Check the list, then start the transfer.
          </p>
        </header>

        <div className="mx-auto mt-10 max-w-xl overflow-hidden rounded-2xl border border-border bg-card">
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

        <div className="mx-auto mt-5 flex max-w-xl items-start gap-3 rounded-2xl bg-muted px-5 py-4 text-left">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Files move directly between browsers over WebRTC. Nothing is uploaded to a server and
            nothing is stored.
          </p>
        </div>

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
            onClick={() => void startTransfer()}
            className="min-w-0 flex-1 px-5 sm:flex-none sm:px-7"
          >
            Start transfer
            <ArrowRight className="button-arrow size-4" />
          </Button>
        </div>
      </section>
    </Shell>
  );
}
