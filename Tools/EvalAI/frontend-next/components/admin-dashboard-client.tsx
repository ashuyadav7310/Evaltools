"use client";

import { FormEvent, useMemo, useState } from "react";
import type { PublicUser } from "@/lib/users";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Notice } from "./ui/notice";

export function AdminDashboardClient({ initialUsers }: { initialUsers: PublicUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const activeCount = useMemo(() => users.filter((user) => user.status === "active").length, [users]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Unable to create user.");
      return;
    }

    setUsers((current) => [data.user, ...current]);
    setEmail("");
    setPassword("");
    setSuccess("User created successfully.");
  }

  async function toggleStatus(user: PublicUser) {
    setError("");
    setSuccess("");
    const nextStatus = user.status === "active" ? "inactive" : "active";
    const response = await fetch(`/api/admin/users/${user.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Unable to update status.");
      return;
    }

    setUsers((current) => current.map((item) => (item.id === user.id ? data.user : item)));
    setSuccess(`User marked ${nextStatus}.`);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-ink">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">{users.length} users, {activeCount} active</p>
          </div>
        </div>
        <form className="grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={create}>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <Input onChange={(event) => setEmail(event.target.value)} placeholder="user@u-next.com" required type="email" value={email} />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <Input minLength={8} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 8 characters" required type="password" value={password} />
          </label>
          <Button className="mt-auto" disabled={loading} type="submit">
            {loading ? "Creating..." : "Create User"}
          </Button>
        </form>
        <div className="mt-4 space-y-2">
          {error ? <Notice message={error} /> : null}
          {success ? <Notice message={success} tone="success" /> : null}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-base font-bold text-ink">Existing Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Created date</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-4 font-medium text-ink">{user.email}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {user.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{new Date(user.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-4 text-right">
                    <Button type="button" variant="secondary" onClick={() => toggleStatus(user)}>
                      Mark {user.status === "active" ? "Inactive" : "Active"}
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-center text-slate-500" colSpan={4}>No users created yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
