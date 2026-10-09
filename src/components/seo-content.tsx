import { ChevronDown } from "lucide-react";
import { FAQS } from "../lib/seo";

const CONTENT_HEADING = "text-2xl font-light leading-[1.15] tracking-tight sm:text-3xl";

/**
 * Crawlable, human-readable copy for search and answer engines. This renders
 * below the sender interface on the landing stage, so it is present in the
 * initial server-rendered HTML that crawlers see.
 *
 * The FAQ answers are pulled from the same FAQS array that builds the FAQPage
 * JSON-LD in src/lib/seo.ts, keeping visible copy and structured data in sync.
 */
export function SeoContent() {
  return (
    <div className="mx-auto mt-20 max-w-2xl border-t border-border pt-14 lg:mt-28 lg:pt-20">
      <section id="what-is-dropoff" aria-labelledby="what-is-dropoff-heading">
        <p className="eyebrow">About Dropoff</p>
        <h2 id="what-is-dropoff-heading" className={`mt-3 text-balance ${CONTENT_HEADING}`}>
          What is Dropoff?
        </h2>
        <div className="mt-5 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <p>
            Dropoff is a free, secure, zero-backend file sharing tool that runs entirely in your
            browser. Pick one or more files and Dropoff creates a private, one-time link. Whoever
            opens that link receives the files straight from your device over an encrypted
            peer-to-peer WebRTC connection.
          </p>
          <p>
            Nothing is uploaded and nothing is stored. Because the transferring browsers act as the
            servers, your files never touch Dropoff's infrastructure, there are no accounts, and
            there is no server-side size limit.
          </p>
        </div>

        <ul className="mt-6 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <li>Client-side processing, no backend file handling</li>
          <li>Zero server upload, zero file storage</li>
          <li>Encrypted peer-to-peer WebRTC transfers</li>
          <li>One-time, unguessable share links</li>
          <li>No accounts, no sign-up, no tracking of file contents</li>
          <li>Free, with no server-imposed file size cap</li>
        </ul>
      </section>

      <section
        id="faq"
        aria-labelledby="faq-heading"
        className="mt-16 border-t border-border pt-14"
      >
        <p className="eyebrow">FAQ</p>
        <h2 id="faq-heading" className={`mt-3 text-balance ${CONTENT_HEADING}`}>
          Frequently asked questions
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Everything you need to know about how Dropoff handles your files.
        </p>

        {/* Native <details> keeps every answer in the DOM for crawlers and answer
            engines while giving readers a clean, keyboard-accessible accordion. */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          {FAQS.map((entry, index) => (
            <details
              key={entry.question}
              open={index === 0}
              className="group border-b border-border last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 transition-colors hover:bg-muted/40 [&::-webkit-details-marker]:hidden">
                <h3 className="text-sm font-medium text-foreground sm:text-base">
                  {entry.question}
                </h3>
                <ChevronDown
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                {entry.answer}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
