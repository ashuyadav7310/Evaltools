import Link from "next/link";
import { AdminAccessForm } from "@/components/admin-access-form";
import { Brand } from "@/components/ui/brand";

export default function AdminAccessPage() {
  return (
    <main className="min-h-screen px-5 py-5">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Brand />
        <Link className="text-sm font-semibold text-slate-600 hover:text-ink" href="/login">Back to login</Link>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-6xl place-items-center">
        <div className="w-full max-w-md rounded-lg border border-line bg-white p-7 shadow-xl shadow-slate-200/60">
          <div className="mb-6">
            <p className="text-sm font-semibold text-brand">Admin Center</p>
            <h1 className="mt-2 text-2xl font-bold text-ink">Validate admin access</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">The admin key is checked securely on the server.</p>
          </div>
          <AdminAccessForm />
        </div>
      </section>
    </main>
  );
}
