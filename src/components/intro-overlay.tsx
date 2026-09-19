import { useEffect, useState } from "react";

const LETTER_MS = 60;
const HOLD_MS = 1000;
const FADE_MS = 700;
const TOTAL_MS = "dropoff".length * LETTER_MS + HOLD_MS;

export function IntroOverlay() {
  const [fading, setFading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setDone(true);
      return;
    }
    const fadeTimer = setTimeout(() => setFading(true), TOTAL_MS);
    const doneTimer = setTimeout(() => setDone(true), TOTAL_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (done) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-[#1a1a1a] transition-opacity duration-700 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <span className="intro-wordmark">
        {"dropoff".split("").map((character, index) => (
          <span
            key={index}
            className="intro-letter"
            style={{ animationDelay: `${index * LETTER_MS}ms` }}
          >
            {character}
          </span>
        ))}
      </span>
      <div className="intro-bar">
        <div className="intro-bar-fill" />
      </div>
    </div>
  );
}
