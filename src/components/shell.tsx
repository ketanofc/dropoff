import { useState, type ReactNode } from "react";
import { AnimatedThemeToggler } from "./animated-theme-toggler";

export function Shell({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);

  return (
    <main className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground transition-colors">
        <div className="mx-auto w-full max-w-[430px] px-5 pb-16 pt-7 sm:px-6 sm:pt-8">
          <header className="flex items-center justify-between">
            <a href="/" className="font-serif text-[22px] font-normal tracking-normal" aria-label="dropoff.lol home">
              dropoff<span className="text-muted-foreground">.lol</span>
            </a>
            <AnimatedThemeToggler
              className="size-9 rounded-full"
              theme={dark ? "dark" : "light"}
              onThemeChange={(theme) => setDark(theme === "dark")}
            />
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
