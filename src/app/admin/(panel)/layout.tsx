import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { AdminShell } from "@/components/admin/Shell";
import { navForRole } from "@/lib/admin-nav";
import { requireUser } from "@/lib/auth";
import { ensureDb } from "@/lib/bootstrap";
import { ROLE_LABELS } from "@/lib/site";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  await ensureDb();
  const user = await requireUser();
  return (
    <AdminShell user={{ name: user.name, email: user.email, role: ROLE_LABELS[user.role] }} nav={navForRole(user.role)}>
        {user.mustChangePassword && (
          <p role="alert" className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            <span className="flex-1">Your account is using a temporary or default password. Change it now to secure the dashboard.</span>
            <Link href="/admin/account" className="a-btn bg-red-700 text-white hover:bg-red-800">Change password</Link>
          </p>
        )}
        {children}
    </AdminShell>
  );
}
