"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center bg-navy-900 px-6 text-center text-white">
      <div className="absolute inset-0 -z-10 bg-blueprint" />
      <Link href="/" aria-label="Ahem Corporation — home">
        <Logo variant="vertical" size={40} />
      </Link>
      <p className="mt-12 font-display text-7xl font-semibold text-gold sm:text-8xl">Oops</p>
      <h1 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-white/70">Please try again. If the problem continues, contact us and quote the reference from your last submission.</p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={() => reset()} className="btn-gold">Try again</button>
        <Link href="/" className="btn-ghost">Back to home</Link>
        <Link href="/contact" className="btn-ghost">Contact us</Link>
      </div>
    </main>
  );
}
