import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { Brand } from "@/components/ui/brand";
import { getUserSession } from "@/lib/session";

export default async function EvalAIPage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  const streamlitUrl = process.env.EVALAI_STREAMLIT_URL || "http://127.0.0.1:3001/evalai";

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <header className="flex items-center justify-between border-b border-line bg-white px-5 py-3">
        <Brand />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-medium text-slate-600 sm:inline">{session.email}</span>
          <LogoutButton />
        </div>
      </header>
      <iframe
        className="h-[calc(100vh-65px)] w-full border-0"
        src={streamlitUrl}
        title="EvalAI workspace"
      />
    </main>
  );
}
