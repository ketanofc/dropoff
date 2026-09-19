import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { flushSync } from "react-dom";
import { cn } from "../lib/utils";

type Theme = "light" | "dark";

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => {
    ready?: Promise<void>;
    finished?: Promise<void>;
  };
};

type AnimatedThemeTogglerProps = Omit<ComponentPropsWithoutRef<"button">, "onChange"> & {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  duration?: number;
};

export function AnimatedThemeToggler({
  className,
  theme,
  onThemeChange,
  duration = 450,
  ...props
}: AnimatedThemeTogglerProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const transitioningRef = useRef(false);

  const cleanup = useCallback(() => {
    transitioningRef.current = false;
    animationRef.current?.cancel();
    animationRef.current = null;
    document.documentElement.removeAttribute("data-theme-transition");
    document.documentElement.style.removeProperty("--theme-toggle-duration");
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const toggleTheme = () => {
    const button = buttonRef.current;
    const documentWithTransition = document as ViewTransitionDocument;
    const startViewTransition = documentWithTransition.startViewTransition;

    if (!button || transitioningRef.current) return;

    const newTheme: Theme = theme === "dark" ? "light" : "dark";
    const { left, top, width, height } = button.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const applyTheme = () => flushSync(() => onThemeChange(newTheme));

    // iOS Safari sometimes leaves the circular reveal frozen as a blurry
    // circle (view-transition snapshots rasterize poorly there), so fall
    // back to an instant theme switch on Apple mobile devices.
    const isIOS =
      typeof navigator !== "undefined" &&
      (/iPhone|iPad|iPod/.test(navigator.platform || "") ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

    if (!startViewTransition || isIOS) {
      applyTheme();
      return;
    }

    transitioningRef.current = true;
    document.documentElement.dataset.themeTransition = "active";
    document.documentElement.style.setProperty("--theme-toggle-duration", `${duration}ms`);

    try {
      const transition = startViewTransition(applyTheme);
      if (transition.finished) {
        transition.finished.finally(cleanup).catch(cleanup);
      }
      if (transition.ready) {
        transition.ready
          .then(() => {
            animationRef.current = document.documentElement.animate(
              {
                clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
              },
              {
                duration,
                easing: "ease-in-out",
                fill: "forwards",
                pseudoElement: "::view-transition-new(root)",
              },
            );
          })
          .catch(cleanup);
      } else {
        cleanup();
      }
    } catch {
      cleanup();
      applyTheme();
    }
  };

  return (
    <button
      {...props}
      ref={buttonRef}
      type="button"
      onClick={toggleTheme}
      className={cn(className)}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
