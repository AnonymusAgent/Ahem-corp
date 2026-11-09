import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/Logo";
import { getUser } from "@/lib/auth";
import { ensureDb } from "@/lib/bootstrap";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  await ensureDb();
  if (await getUser()) redirect("/admin");
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative isolate hidden flex-col justify-between overflow-hidden bg-navy-900 p-12 text-white lg:flex">
        <div className="absolute inset-0 -z-10 bg-blueprint" />
        <Link href="/" aria-label="Ahem Corporation — website"><Logo size={44} /></Link>
        <div>
          <p className="font-display text-4xl font-semibold leading-tight">Building Infrastructure.<span className="block text-gold">Engineering Tomorrow.</span></p>
          <p className="mt-5 max-w-md text-white/70">Administration console for tenders, leads, projects, content and compliance documents.</p>
        </div>
        <p className="flex items-center gap-2 text-sm text-white/60"><ShieldCheck className="h-4 w-4 text-gold" aria-hidden /> Authorised personnel only. Activity is logged.</p>
      </div>
      <div className="flex items-center justify-center bg-white px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="lg:hidden"><Logo tone="dark" size={40} /></div>
          <h1 className="mt-8 font-display text-2xl font-semibold text-navy lg:mt-0">Sign in to the admin dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Use the email address and password issued by your administrator.</p>
          <div className="mt-8"><LoginForm /></div>
          <Link href="/" className="mt-8 inline-block text-sm font-medium text-slate-600 hover:text-navy">← Back to website</Link>
        </div>
      </div>
    </main>
  );
}
