"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/sources", label: " Sources" },
  ];

  return (
    <div className="w-64 min-h-screen bg-white border-r flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-blue-600">DataFlow CI</h1>
        <p className="text-xs text-gray-400">Plateforme d'ingestion</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`block px-4 py-2 rounded-md text-sm transition ${
                  pathname.startsWith(link.href)
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md transition"
        >
          Se déconnecter
        </button>
      </div>
    </div>
  );
}