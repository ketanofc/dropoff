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

        <dl className="mt-8 flex flex-col gap-7">
          {FAQS.map((entry) => (
            <div key={entry.question}>
              <dt className="text-base font-medium text-foreground">{entry.question}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{entry.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
