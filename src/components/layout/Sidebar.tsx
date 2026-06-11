"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Database,
  LogOut,
  Activity,
  Building2,
  Bell,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Notification {
  id: number;
  message: string;
  lue: boolean;
  createdAt: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/sources", label: "Sources", icon: Database },
    ...(isAdmin ? [{ href: "/organisations", label: "Organisations", icon: Building2 }] : []),
  ];

  const nonLues = notifications.filter((n) => !n.lue).length;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(Array.isArray(data) ? data : []));
  };

  const marquerCommeLues = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, lue: true })));
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && nonLues > 0) {
      marquerCommeLues();
    }
  };

  return (
    <aside className="w-60 min-h-screen flex flex-col relative" style={{ backgroundColor: "#0F1729" }}>
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

      {/* Notifications */}
      <div className="px-3 py-2 border-t" style={{ borderColor: "#1E3A5F" }}>
        <button
          onClick={toggleNotifications}
          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-all"
          style={{ color: "#94A3B8" }}
        >
          <div className="flex items-center gap-3">
            <Bell size={16} />
            <span>Notifications</span>
          </div>
          {nonLues > 0 && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: "#2563EB", color: "white" }}
            >
              {nonLues}
            </span>
          )}
        </button>

        {showNotifications && (
          <div
            className="mt-2 rounded-xl overflow-hidden"
            style={{ backgroundColor: "#0A0F1E", border: "1px solid #1E3A5F" }}
          >
            {notifications.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "#475569" }}>
                Aucune notification
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="px-3 py-2 border-b text-xs"
                    style={{
                      borderColor: "#1E3A5F",
                      backgroundColor: n.lue ? "transparent" : "#0F2040",
                      color: n.lue ? "#64748B" : "#CBD5E1",
                    }}
                  >
                    <p>{n.message}</p>
                    <p className="mt-0.5" style={{ color: "#475569" }}>
                      {new Date(n.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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