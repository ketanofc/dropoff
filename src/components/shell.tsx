import type { ReactNode } from "react";

export const HERO_HEADING =
  "text-4xl font-light leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl";

export const PAGE_HEADING =
  "font-display text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl";

export const SECTION_HEADING = "text-3xl font-light leading-[1.1] tracking-tight sm:text-4xl";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col overflow-x-hidden px-5 pb-16 pt-7 sm:px-6 sm:pt-8 md:max-w-4xl lg:max-w-5xl lg:px-10 lg:pb-20 lg:pt-10">
        <header className="flex items-center justify-between border-b border-border pb-5">
          <a
            href="/"
            className="font-logo text-[22px] leading-none tracking-normal"
            aria-label="dropoff.lol home"
          >
            dropoff
          </a>
          <nav className="flex items-center gap-6 text-[15px] text-muted-foreground">
            <a href="/blog" className="transition-colors hover:text-foreground">
              blog
            </a>
          </nav>
        </header>
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </div>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border pt-10 lg:mt-32">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:justify-between sm:text-left">
        <p className="max-w-xs text-sm text-muted-foreground">
          dropoff is peer to peer file sharing, nothing is uploaded, nothing is stored.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[15px] text-muted-foreground sm:justify-end">
          <a
            href="/about"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            about us
          </a>
          <a
            href="/terms"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            terms
          </a>
          <a
            href="mailto:admin.dropoff@gmail.com"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            contact
          </a>
          <a
            href="https://github.com/ketanofc/dropoff"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
