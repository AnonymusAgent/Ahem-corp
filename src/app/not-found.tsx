import Link from "next/link";
import { Logo } from "@/components/Logo";

export const metadata = { title: "Page not found | Ahem Corporation", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center bg-navy-900 px-6 text-center text-white">
      <div className="absolute inset-0 -z-10 bg-blueprint" />
      <Link href="/" aria-label="Ahem Corporation — home">
        <Logo variant="vertical" size={40} />
      </Link>
      <p className="mt-12 font-display text-7xl font-semibold text-gold sm:text-8xl">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">This page could not be found</h1>
      <p className="mt-3 max-w-md text-white/70">The page may have been moved or is no longer published.</p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn-gold">Back to home</Link>
        <Link href="/projects" className="btn-ghost">Explore our projects</Link>
        <Link href="/contact" className="btn-ghost">Contact us</Link>
      </div>
    </main>
  );
}
