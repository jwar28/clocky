"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users, Settings, LogOut, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Brand } from "./Brand";
import { useSessionStore } from "@/store/session-store";

const NAV_ITEMS = [
  { href: "/schedule", label: "Malla Horaria", icon: LayoutGrid },
  { href: "/staff", label: "Personal", icon: Users },
  { href: "/settings", label: "Configuración", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const signOut = useSessionStore((s) => s.signOut);
  const user = useSessionStore((s) => s.user);

  return (
    <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-r border-outline-variant bg-card md:flex">
      {/* Brand */}
      <div className="flex h-16 items-center border-b border-outline-variant px-5">
        <Brand />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded px-3 py-2 text-body-sm transition-colors",
                    active
                      ? "bg-secondary-container text-primary font-semibold"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-outline-variant p-3">
        <div className="mb-2 truncate px-3 text-body-sm font-medium" title={user?.email}>
          {user?.email ?? "—"}
        </div>
        <button
          type="button"
          onClick={() => {
            void signOut();
          }}
          className="flex w-full items-center gap-3 rounded px-3 py-2 text-body-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

export function SidebarMobile() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-30 flex h-14 w-full items-center gap-1 border-b border-outline-variant bg-card px-2 md:hidden">
      <Brand collapsed />
      <div className="ml-auto flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded",
                active ? "bg-secondary-container text-primary" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}