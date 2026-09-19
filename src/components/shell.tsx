import type { ReactNode } from "react";
import { SiteMenu } from "./site-menu";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main>
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-[430px] overflow-x-hidden px-5 pb-16 pt-7 sm:px-6 sm:pt-8 md:max-w-4xl lg:max-w-6xl lg:px-10 lg:pb-20 lg:pt-10">
          <header className="flex items-center justify-between">
            <a
              href="/"
              className="font-sans text-[19px] tracking-normal"
              aria-label="dropoff.lol home"
            >
              <span className="font-bold">dropoff</span>
              <span className="font-normal text-neutral-400">.lol</span>
            </a>
            <SiteMenu />
          </header>
          {children}
        </div>
      </div>
    </main>
  );
}

export function Progress({ value }: { value: number }) {
  return (
    <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-[width] duration-200"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
