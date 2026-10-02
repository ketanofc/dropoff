import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { SuccessTick } from "../components/success-tick";
import { SECTION_HEADING, Shell } from "../components/shell";
import { useTransfer } from "../lib/transfer-context";

export const Route = createFileRoute("/success")({
  component: SuccessPage,
});

function SuccessPage() {
  const { files, phase, link, sent, total, reset } = useTransfer();
  const navigate = useNavigate();

  // This screen celebrates link creation. Anything else on arrival means the
  // flow was entered cold, so send the user somewhere that makes sense.
  useEffect(() => {
    if (link) return;
    if (phase === "error") {
      void navigate({ to: "/" });
      return;
    }
    void navigate({ to: "/" });
  }, [link, phase, navigate]);

  const percent = total ? Math.min(100, (sent / total) * 100) : 0;
  const isTransferring = phase === "transferring";
  const isDone = phase === "complete";

  return (
    <Shell>
      <section className="py-20 text-center lg:py-28">
        <div className="mx-auto max-w-xl">
          <SuccessTick withSound withConfetti />

          <h1 className={`mx-auto mt-8 max-w-lg text-balance ${SECTION_HEADING}`}>Link ready</h1>

          <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
            Send it to the other device, then leave this tab open while the files move across.
          </p>

          {/* Once the recipient accepts, progress continues in the background
              from this same page rather than on a separate screen. */}
          {(isTransferring || isDone) && (
            <div className="mt-8">
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="sending-shimmer relative h-full overflow-hidden rounded-full bg-primary transition-[width] duration-200"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {isDone ? "All files delivered" : `Sending ${percent.toFixed(0)}%`}
              </p>
            </div>
          )}

          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button onClick={() => void navigate({ to: "/share" })} className="w-full sm:w-auto">
              Share the link
              <ArrowRight className="button-arrow size-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                reset();
                void navigate({ to: "/" });
              }}
              className="w-full sm:w-auto"
            >
              Send another
            </Button>
          </div>
        </div>
      </section>
    </Shell>
  );
}
