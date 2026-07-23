"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const MAX_ATTEMPTS = 30;
const RETRY_DELAY_MS = 100;
const EXTRA_GAP_PX = 12;

/**
 * Handles hash navigation in the Next.js App Router while keeping the target
 * visible below the sticky navbar.
 */
export default function ScrollToHash() {
  const pathname = usePathname();

  useEffect(() => {
    let attempts = 0;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;
    let correctionTimeout: ReturnType<typeof setTimeout> | undefined;
    let firstFrame: number | undefined;
    let secondFrame: number | undefined;
    let cancelled = false;

    const getScrollTop = (target: HTMLElement) => {
      const navbar = document.querySelector<HTMLElement>("[data-site-navbar]");
      const navbarHeight = navbar?.offsetHeight ?? 64;
      const targetTop = target.getBoundingClientRect().top + window.scrollY;

      return Math.max(0, targetTop - navbarHeight - EXTRA_GAP_PX);
    };

    const alignTarget = (target: HTMLElement, behavior: ScrollBehavior) => {
      window.scrollTo({
        top: getScrollTop(target),
        behavior,
      });
    };

    const tryScroll = () => {
      if (cancelled) return;

      const hash = window.location.hash;
      if (!hash) return;

      const id = decodeURIComponent(hash.slice(1));
      const target = document.getElementById(id);

      // On mobile the drawer locks body scrolling. Do not try to scroll until
      // that lock has been removed.
      const bodyIsLocked =
        window.getComputedStyle(document.body).overflow === "hidden";

      if (!target || bodyIsLocked) {
        attempts += 1;

        if (attempts < MAX_ATTEMPTS) {
          retryTimeout = setTimeout(tryScroll, RETRY_DELAY_MS);
        }

        return;
      }

      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          if (cancelled) return;

          alignTarget(target, "smooth");

          // Mobile layouts can shift slightly while fonts/images settle or
          // while the browser toolbar changes size. Correct the final position
          // once after the smooth scroll finishes.
          correctionTimeout = setTimeout(() => {
            if (!cancelled) {
              alignTarget(target, "auto");
            }
          }, 500);
        });
      });
    };

    const handleHashChange = () => {
      attempts = 0;
      tryScroll();
    };

    tryScroll();
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      cancelled = true;
      window.removeEventListener("hashchange", handleHashChange);

      if (retryTimeout) clearTimeout(retryTimeout);
      if (correctionTimeout) clearTimeout(correctionTimeout);
      if (firstFrame) cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
    };
  }, [pathname]);

  return null;
}
