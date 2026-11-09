"use client";

import Lenis from "lenis";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";

/** Inertial smooth scrolling on pointer devices. Touch devices and reduced-motion users keep native scrolling. */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.matchMedia("(pointer: coarse)").matches) return;
    const instance = new Lenis({ duration: 1.05, smoothWheel: true });
    lenis.current = instance;
    let raf = requestAnimationFrame(function loop(time) {
      instance.raf(time);
      raf = requestAnimationFrame(loop);
    });
    return () => {
      cancelAnimationFrame(raf);
      instance.destroy();
      lenis.current = null;
    };
  }, []);

  useEffect(() => {
    if (!window.location.hash) lenis.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}

/** Sends a cookie-less page-view beacon to the first-party analytics endpoint. */
export function Tracker() {
  const pathname = usePathname();
  useEffect(() => {
    const id = window.setTimeout(() => {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-ahem-csrf": "1" },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      }).catch(() => undefined);
    }, 800);
    return () => window.clearTimeout(id);
  }, [pathname]);
  return null;
}

const CONSENT_KEY = "ahem-consent";

/**
 * Cookie notice. Shown only when a Google Analytics ID is configured — without it the site sets no
 * optional cookies (first-party page counts are cookie-less), so there is nothing to ask consent for.
 * Analytics is loaded only after the visitor accepts.
 */
export function CookieConsent({ gaId }: { gaId: string }) {
  const [choice, setChoice] = useState<"unknown" | "accepted" | "declined" | "pending">("unknown");

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    setChoice(stored === "accepted" || stored === "declined" ? stored : "pending");
  }, []);

  function decide(value: "accepted" | "declined") {
    window.localStorage.setItem(CONSENT_KEY, value);
    setChoice(value);
  }

  const validGa = /^G-[A-Z0-9]{4,}$/.test(gaId);
  if (!validGa) return null;
  return (
    <>
      {validGa && choice === "accepted" && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {choice === "pending" && (
        <div role="dialog" aria-label="Cookie preferences" className="fixed inset-x-3 bottom-3 z-[60] rounded-2xl border border-white/10 bg-navy-900/95 p-4 text-white shadow-2xl backdrop-blur sm:inset-x-auto sm:bottom-5 sm:right-24 sm:max-w-sm sm:p-5">
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-white/80">
              With your permission we use analytics cookies to understand how the site is used.{" "}
              <Link href="/legal/cookie-policy" className="text-gold underline underline-offset-4">
                Cookie policy
              </Link>
            </p>
            <div className="flex shrink-0 gap-2">
              <button onClick={() => decide("declined")} className="min-h-11 rounded-full border border-white/25 px-4 text-sm font-semibold hover:border-white">
                Essential only
              </button>
              <button onClick={() => decide("accepted")} className="min-h-11 rounded-full bg-gold px-5 text-sm font-semibold text-navy-900 hover:bg-gold-300">
                Accept analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Floating WhatsApp button — rendered only when a valid number is configured. */
export function WhatsAppButton({ number, message }: { number: string; message: string }) {
  const digits = number.replace(/\D/g, "");
  return (
    <a
      href={`https://wa.me/${digits}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#1FAF54] text-white shadow-xl transition hover:scale-105 hover:bg-[#17994a]"
    >
      <MessageCircle className="h-6 w-6" aria-hidden />
    </a>
  );
}
