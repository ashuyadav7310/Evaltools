import Link from "next/link";
import { Brand } from "@/components/ui/brand";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen px-5 py-5">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Brand />
        <Link className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink shadow-sm transition hover:bg-slate-50" href="/admin-access">
          Admin Center
        </Link>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-6xl place-items-center">
        <div className="w-full max-w-md rounded-lg border border-line bg-white p-7 shadow-xl shadow-slate-200/60">
          <div className="mb-6">
            <p className="text-sm font-semibold text-brand">Secure access</p>
            <h1 className="mt-2 text-2xl font-bold text-ink">Login to EvalAI</h1>
          </div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
