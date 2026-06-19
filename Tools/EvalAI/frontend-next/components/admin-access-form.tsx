"use client";

import { FormEvent, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Notice } from "./ui/notice";

export function AdminAccessForm() {
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/admin/access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminKey })
    });
    const data = await response.json();

    setLoading(false);
    if (!response.ok) {
      setError(data.error || "UNAUTHORIZED ACCESS");
      return;
    }

    window.location.href = data.redirectTo || "/admin-dashboard";
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      {error ? <Notice message={error} /> : null}
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Admin Key</span>
        <Input autoComplete="off" onChange={(event) => setAdminKey(event.target.value)} placeholder="Enter admin key" required type="password" value={adminKey} />
      </label>
      <Button className="w-full" disabled={loading} type="submit">
        {loading ? "Validating..." : "Open Admin Dashboard"}
      </Button>
    </form>
  );
}
