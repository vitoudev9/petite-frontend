"use client";

import { useSession } from "next-auth/react";

type Role = "owner" | "staff" | "receptionist";

interface Props {
  allowedRoles: Role[];
  children: React.ReactNode;
  /**
   * hide   — completely removes the element from DOM (default)
   * disable — renders but disables interactions with reduced opacity
   */
  fallback?: "hide" | "disable";
}

export default function RoleGuard({ allowedRoles, children, fallback = "hide" }: Props) {
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;

  const allowed = role ? allowedRoles.includes(role) : false;

  if (allowed) return <>{children}</>;

  if (fallback === "disable") {
    return (
      <div className="opacity-40 pointer-events-none select-none">
        {children}
      </div>
    );
  }

  // fallback === "hide"
  return null;
}