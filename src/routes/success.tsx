import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, PartyPopper } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { SuccessTick } from "../components/success-tick";
import { SECTION_HEADING, Shell } from "../components/shell";
import { useTransfer } from "../lib/transfer-context";

export const Route = createFileRoute("/success")({
  component: SuccessPage,
});

function SuccessPage() {
  const { files, phase, reset } = useTransfer();
  const navigate = useNavigate();

  // The sending page drives the transfer; land here once it reports done.
  useEffect(() => {
    if (phase === "complete") return;
    if (phase === "error") {
      void navigate({ to: "/sending" });
      return;
    }
    void navigate({ to: "/files" });
  }, [phase, navigate]);

  return (
    <Shell>
      <section className="py-20 text-center lg:py-28">
        <div className="mx-auto max-w-xl rounded-2xl border border-border bg-card px-6 py-10 sm:px-10 sm:py-12">
          <p className="eyebrow">Step 3 of 3</p>

          <div className="mt-6">
            <SuccessTick withSound withConfetti />
          </div>

          <h1 className={`mx-auto mt-8 max-w-lg text-balance ${SECTION_HEADING}`}>
            Transfer complete
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            {files.length === 1
              ? "The file was delivered to the recipient."
              : `All ${files.length} files were delivered to the recipient.`}
          </p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={() => {
                reset();
                void navigate({ to: "/" });
              }}
              className="w-full sm:w-auto"
            >
              Send another file
              <ArrowRight className="button-arrow size-4" />
            </Button>
          </div>

          <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <PartyPopper className="size-3.5" />
            Nothing was stored, the bytes went straight across.
          </p>
        </div>
      </section>
    </Shell>
  );
}
