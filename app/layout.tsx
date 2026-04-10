"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays, Users, UserCheck, Scissors, BellRing, CreditCard,
} from "lucide-react";
import clsx from "clsx";
import "./globals.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

const NAV = [
  { href: "/",           label: "Appointments",  icon: CalendarDays, dot: "#378ADD" },
  { href: "/clients",    label: "Clients",   icon: Users,        dot: "#1D9E75" },
  { href: "/staffs",     label: "Staff",     icon: UserCheck,    dot: "#D85A30" },
  { href: "/services",   label: "Services",  icon: Scissors,     dot: "#9B59B6" },
  { href: "/reminders",  label: "Reminders", icon: BellRing,     dot: "#BA7517" },
  { href: "/checkout",   label: "Checkout",  icon: CreditCard,   dot: "#0F6E56" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <div className="flex h-screen bg-gray-50 font-sans text-sm text-gray-900 overflow-hidden">

            {/* Sidebar */}
            <aside className="w-52 shrink-0 border-r border-gray-200 bg-white flex flex-col py-4 px-3 gap-1">
              <div className="px-3 pb-4 text-[15px] font-semibold tracking-tight text-gray-900">
                Glowdesk
              </div>

              {NAV.map(({ href, label, icon: Icon, dot }) => {
                const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={clsx(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors",
                      active
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    )}
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
                    <Icon size={14} strokeWidth={1.8} />
                    {label}
                  </Link>
                );
              })}

              <div className="mt-auto pt-3 border-t border-gray-100 px-3">
                <p className="text-[11px] text-gray-400">
                  {new Date().toLocaleDateString("en-GB", {
                    weekday: "short", day: "numeric", month: "short", year: "numeric",
                  })}
                </p>
              </div>
            </aside>

            {/* Main */}
            <main className="flex-1 flex flex-col overflow-hidden">
              {children}
            </main>

          </div>
        </QueryClientProvider>
      </body>
    </html>
  );
}
