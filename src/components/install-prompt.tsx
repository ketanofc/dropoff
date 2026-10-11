import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "./ui/button";

const DISMISS_KEY = "dropoff_install_dismissed";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const EXIT_MS = 300;

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const displayMode = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return displayMode || iosStandalone;
}

function wasRecentlyDismissed(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return true;
    return Date.now() - dismissedAt < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const promptEvent = useRef<BeforeInstallPromptEvent | null>(null);
  const sessionDismissed = useRef(false);

  const close = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => setMounted(false), EXIT_MS);
  }, []);

  useEffect(() => {
    if (isStandalone()) return;
    if (wasRecentlyDismissed()) {
      sessionDismissed.current = true;
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (sessionDismissed.current) return;
      promptEvent.current = event as BeforeInstallPromptEvent;
      setMounted(true);
    };

    const onAppInstalled = () => {
      promptEvent.current = null;
      sessionDismissed.current = true;
      try {
        window.localStorage.removeItem(DISMISS_KEY);
      } catch {
        // Ignore storage failures (private mode, disabled cookies).
      }
      close();
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onAppInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [close]);

  const handleInstall = useCallback(() => {
    const event = promptEvent.current;
    close();
    if (!event) return;
    void (async () => {
      try {
        await event.prompt();
        await event.userChoice;
      } catch {
        // The user dismissed the native prompt or it is no longer available.
      } finally {
        promptEvent.current = null;
      }
    })();
  }, [close]);

  const handleDismiss = useCallback(() => {
    sessionDismissed.current = true;
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Ignore storage failures (private mode, disabled cookies).
    }
    close();
  }, [close]);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-4 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:p-0">
      <div
        role="dialog"
        aria-label="Install Dropoff"
        className={`install-toast ${
          closing ? "is-closing" : ""
        } pointer-events-auto flex w-full max-w-[380px] items-start gap-3 rounded-2xl border border-white/10 bg-[#151515] p-3.5 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]`}
      >
        <img
          src="/android-chrome-192x192.png"
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-medium leading-snug text-white">
            Install Dropoff for faster, offline access
          </p>
          <p className="mt-0.5 text-[12px] leading-snug text-white/55">No app store required</p>
          <Button
            type="button"
            size="sm"
            onClick={handleInstall}
            className="mt-3 h-9 rounded-lg bg-white px-4 text-[13px] font-semibold text-[#151515] hover:bg-white/90"
          >
            Install
          </Button>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="-m-1 shrink-0 rounded-lg p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
