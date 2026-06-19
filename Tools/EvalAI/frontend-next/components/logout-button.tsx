"use client";

import { useState } from "react";
import { Button } from "./ui/button";

export function LogoutButton({ variant = "secondary" }: { variant?: "secondary" | "primary" }) {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    const response = await fetch("/api/auth/logout", { method: "POST" });
    const data = await response.json();
    window.location.href = data.redirectTo || "/login";
  }

  return (
    <Button type="button" variant={variant} onClick={logout} disabled={loading}>
      {loading ? "Signing out..." : "Logout"}
    </Button>
  );
}
