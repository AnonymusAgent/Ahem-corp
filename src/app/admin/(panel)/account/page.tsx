import { AccountForm } from "@/components/admin/AccountForm";
import { requireUser } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/site";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy">My account</h1>
        <p className="mt-1 text-sm text-slate-600">Signed in as <strong>{user.name}</strong> ({user.email}) · {ROLE_LABELS[user.role]}</p>
      </div>
      <AccountForm />
    </div>
  );
}
