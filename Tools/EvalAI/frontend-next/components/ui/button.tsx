import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary: "bg-brand text-white hover:bg-[#dc5f17]",
  secondary: "border border-line bg-white text-ink hover:bg-slate-50",
  danger: "bg-red-600 text-white hover:bg-red-700"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
