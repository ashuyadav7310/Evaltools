import { redirect } from "next/navigation";
import { AdminDashboardClient } from "@/components/admin-dashboard-client";
import { LogoutButton } from "@/components/logout-button";
import { Brand } from "@/components/ui/brand";
import { getAdminSession } from "@/lib/session";
import { listUsers } from "@/lib/users";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin-access");
  }

  const users = await listUsers();

  return (
    <main className="min-h-screen px-5 py-5">
      <header className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
        <Brand />
        <LogoutButton />
      </header>
      <div className="mx-auto max-w-6xl">
        <AdminDashboardClient initialUsers={users} />
      </div>
    </main>
  );
}
