import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, X } from "lucide-react";

import { Button } from "./ui/button";

const DISMISS_KEY = "dropoff_install_dismissed";
const IOS_DISMISS_KEY = "dropoff_ios_toast_dismissed";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const IOS_DELAY_MS = 3000;
const EXIT_MS = 300;

type Variant = "chromium" | "ios";

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

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  // iPadOS 13+ masquerades as macOS but reports touch points.
  const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || iPadOS;
}

function isSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isOtherIOSBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|GSA/.test(ua);
  return /Safari/.test(ua) && !isOtherIOSBrowser;
}

function wasRecentlyDismissed(key: string): boolean {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return false;
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) return true;
    return Date.now() - dismissedAt < DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

function persistDismissal(key: string) {
  try {
    window.localStorage.setItem(key, String(Date.now()));
  } catch {
    // Ignore storage failures (private mode, disabled cookies).
  }
}

function IOSShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="inline-block size-4 shrink-0 align-[-2px] text-white"
    >
      <path d="M12 3v12" />
      <path d="m8 7 4-4 4 4" />
      <path d="M6 11H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1" />
    </svg>
  );
}

export function InstallPrompt() {
  const [variant, setVariant] = useState<Variant | null>(null);
  const [closing, setClosing] = useState(false);
  const promptEvent = useRef<BeforeInstallPromptEvent | null>(null);
  const sessionDismissed = useRef(false);

  const close = useCallback(() => {
    setClosing(true);
    window.setTimeout(() => setVariant(null), EXIT_MS);
  }, []);

  useEffect(() => {
    if (isStandalone()) return;

    // iOS Safari never fires beforeinstallprompt, so guide the user manually.
    if (isIOS() && isSafari()) {
      if (wasRecentlyDismissed(IOS_DISMISS_KEY)) return;
      const timer = window.setTimeout(() => setVariant("ios"), IOS_DELAY_MS);
      return () => window.clearTimeout(timer);
    }

    if (wasRecentlyDismissed(DISMISS_KEY)) {
      sessionDismissed.current = true;
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (sessionDismissed.current) return;
      promptEvent.current = event as BeforeInstallPromptEvent;
      setVariant("chromium");
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
    persistDismissal(DISMISS_KEY);
    close();
  }, [close]);

  const handleIOSDismiss = useCallback(() => {
    persistDismissal(IOS_DISMISS_KEY);
    close();
  }, [close]);

  if (!variant) return null;

  if (variant === "ios") {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-1 p-4">
        <div
          role="dialog"
          aria-label="Install Dropoff on iPhone"
          className={`install-toast ${
            closing ? "is-closing" : ""
          } pointer-events-auto w-full max-w-[400px] rounded-2xl border border-white/10 bg-[#151515]/90 p-4 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl`}
        >
          <div className="flex items-start gap-3">
            <img
              src="/android-chrome-192x192.png"
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-xl"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-semibold leading-snug text-white">
                Install Dropoff on iPhone
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-white/55">
                Two taps and it's on your Home Screen
              </p>
            </div>
            <button
              type="button"
              onClick={handleIOSDismiss}
              aria-label="Dismiss install instructions"
              className="-m-1 shrink-0 rounded-lg p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          <ol className="mt-3.5 space-y-2.5 text-[13px] leading-snug text-white/85">
            <li className="flex items-start gap-2.5">
              <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white">
                1
              </span>
              <span className="flex flex-wrap items-center gap-1.5">
                Tap the <IOSShareIcon /> Share button in Safari.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white">
                2
              </span>
              <span>
                Scroll down and tap{" "}
                <span className="font-semibold text-white">"Add to Home Screen"</span>.
              </span>
            </li>
          </ol>

          <div className="mt-3.5 flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={handleIOSDismiss}
              className="h-9 rounded-lg bg-white px-4 text-[13px] font-semibold text-[#151515] hover:bg-white/90"
            >
              Got it
            </Button>
          </div>
        </div>
        <ArrowDown aria-hidden="true" className="install-arrow size-5 text-white/70" />
      </div>
    );
  }

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
