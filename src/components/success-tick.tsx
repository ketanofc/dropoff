import confetti from "canvas-confetti";
import { useEffect, useRef } from "react";

type SuccessTickProps = {
  /** Plays the chime on mount. */
  withSound?: boolean;
  /** Fires the party popper. */
  withConfetti?: boolean;
};

/**
 * Payment-style success mark: the ring scales in, then the tick draws itself.
 * Animations are driven by CSS classes rather than JS so the browser can run
 * them on the compositor.
 */
export function SuccessTick({ withSound = false, withConfetti = false }: SuccessTickProps) {
  const ran = useRef(false);

  useEffect(() => {
    // Guard against double-invocation under React StrictMode.
    if (ran.current) return;
    ran.current = true;

    if (withSound) {
      void import("../lib/success-sound").then(({ playSuccessChime }) => playSuccessChime());
    }

    if (withConfetti) {
      // Respect the OS reduced-motion setting rather than firing regardless.
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const colors = ["#ffe600", "#0a0a0a", "#ffffff", "#4ade80", "#60a5fa"];
        const shoot = (ratio: number, opts: confetti.Options) => {
          confetti({
            ...opts,
            origin: { y: 0.62 },
            colors,
            disableForReducedMotion: true,
            particleCount: Math.floor(140 * ratio),
          });
        };
        shoot(0.25, { spread: 26, startVelocity: 55 });
        shoot(0.2, { spread: 60 });
        shoot(0.35, { spread: 100, decay: 0.91, scalar: 0.85 });
        shoot(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.15 });
        shoot(0.1, { spread: 120, startVelocity: 45 });
      }
    }
  }, [withSound, withConfetti]);

  return (
    <div className="flex justify-center">
      <div className="success-tick">
        <svg viewBox="0 0 72 72" className="size-full" role="img" aria-label="Transfer complete">
          <circle
            cx="36"
            cy="36"
            r="34"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="success-ring"
          />
          <path
            d="M22 37.5 31.5 47 50 27"
            fill="none"
            stroke="currentColor"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="success-check"
          />
        </svg>
      </div>
    </div>
  );
}
