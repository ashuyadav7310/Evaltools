"use client";

import { FormEvent, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Notice } from "./ui/notice";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();

    setLoading(false);
    if (!response.ok) {
      setError(data.error || "Unable to log in.");
      return;
    }

    window.location.href = data.redirectTo || "/evalai";
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      {error ? <Notice message={error} /> : null}
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Email ID</span>
        <Input autoComplete="email" inputMode="email" onChange={(event) => setEmail(event.target.value)} placeholder="name@u-next.com" required type="email" value={email} />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700">Password</span>
        <Input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} placeholder="Enter password" required type="password" value={password} />
      </label>
      <Button className="w-full" disabled={loading} type="submit">
        {loading ? "Checking..." : "Login"}
      </Button>
    </form>
  );
}
