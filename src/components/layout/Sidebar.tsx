"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Database,
  LogOut,
  Activity,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sources", label: "Sources", icon: Database },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen flex flex-col" style={{ backgroundColor: "#0F1729" }}>
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: "#1E3A5F" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#2563EB" }}>
            <Activity size={16} color="white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">DataFlow CI</p>
            <p className="text-xs" style={{ color: "#64748B" }}>Ingestion de données</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <p className="text-xs font-medium px-3 mb-2" style={{ color: "#475569" }}>
          NAVIGATION
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: isActive ? "#1E3A5F" : "transparent",
                    color: isActive ? "#FFFFFF" : "#94A3B8",
                  }}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Déconnexion */}
      <div className="px-3 py-4 border-t" style={{ borderColor: "#1E3A5F" }}>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-all"
          style={{ color: "#94A3B8" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#1E3A5F";
            e.currentTarget.style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#94A3B8";
          }}
        >
          <LogOut size={16} />
          Se déconnecter
        </button>
      </div>
    </aside>
  );
}