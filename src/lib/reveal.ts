import { useEffect, useRef, useState } from "react";

/**
 * Fades and lifts an element into view the first time it enters the viewport.
 * The hidden state lives in CSS (.reveal), so server-rendered markup keeps the
 * content in the DOM for crawlers while reduced-motion and no-JS users see it
 * immediately. Attach the returned ref and class directly to an existing
 * element to avoid inserting wrapper nodes that could disturb layout.
 */
export function useReveal<T extends HTMLElement = HTMLElement>(options?: {
  threshold?: number;
  rootMargin?: string;
}) {
  const threshold = options?.threshold ?? 0.15;
  const rootMargin = options?.rootMargin ?? "0px 0px -10% 0px";
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, visible };
}

export function revealClass(visible: boolean, className = ""): string {
  return `reveal${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`;
}
