"use client";

import clsx from "clsx";
import { X } from "lucide-react";

// ── Badge ─────────────────────────────────────────────────────────────────────

const badgeVariants: Record<string, string> = {
  confirmed: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
  cancelled:  "bg-red-50 text-red-700",
  no_show:    "bg-amber-50 text-amber-700",
  default:    "bg-gray-100 text-gray-600",
};

export function Badge({ label, variant }: { label: string; variant?: string }) {
  const cls = badgeVariants[variant ?? label] ?? badgeVariants.default;
  return (
    <span className={clsx("inline-block text-[11px] px-2 py-0.5 rounded-full font-medium", cls)}>
      {label}
    </span>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────

export function Avatar({
  name,
  color = "#378ADD",
  size = 36,
}: {
  name: string;
  color?: string;
  size?: number;
}) {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const textColor = "#fff";
  return (
    <span
      className="inline-flex items-center justify-center rounded-full font-medium shrink-0"
      style={{ width: size, height: size, background: color, color: textColor, fontSize: size * 0.35 }}
    >
      {initials}
    </span>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-600 animate-spin",
        className
      )}
    />
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm w-full max-w-md mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto p-5 flex-1">{children}</div>
      </div>
    </div>
  );
}

// ── FormField ─────────────────────────────────────────────────────────────────

export function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 mb-3">
      <label className="text-[12px] text-gray-500">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 text-[13px] border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={clsx(inputCls, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={clsx(inputCls, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={clsx(inputCls, props.className)} />;
}

// ── Button ────────────────────────────────────────────────────────────────────

export function Button({
  variant = "default",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "primary" | "danger" | "ghost";
  size?: "sm" | "md";
}) {
  const base = "inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50";
  const sizes = { sm: "px-2.5 py-1 text-[12px]", md: "px-3.5 py-2 text-[13px]" };
  const variants = {
    default:  "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
    primary:  "bg-gray-900 border border-gray-900 text-white hover:bg-gray-800",
    danger:   "bg-white border border-red-200 text-red-600 hover:bg-red-50",
    ghost:    "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-800",
  };
  return (
    <button {...props} className={clsx(base, sizes[size], variants[variant], className)} />
  );
}

// ── PageHeader ────────────────────────────────────────────────────────────────

export function PageHeader({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
      <h1 className="text-[15px] font-semibold">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────────────────────────

export function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 rounded-lg px-4 py-3">
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      <p className="text-[20px] font-semibold text-gray-900">{value}</p>
    </div>
  );
}
