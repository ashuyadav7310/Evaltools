export function Notice({ message, tone = "error" }: { message: string; tone?: "error" | "success" }) {
  const classes =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-red-200 bg-red-50 text-red-700";

  return <div className={`rounded-md border px-3 py-2 text-sm font-medium ${classes}`}>{message}</div>;
}
