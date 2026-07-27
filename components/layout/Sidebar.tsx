"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import {
  LayoutGrid,
  LogOut,
  Pin,
  PinOff,
  Settings,
  Users,
} from "lucide-react";
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils/cn";
import { APP_NAME } from "@/lib/constants";
import { Brand } from "./Brand";
import { useSessionStore } from "@/store/session-store";

const NAV_ITEMS = [
  { href: "/schedule", label: "Malla Horaria", icon: LayoutGrid },
  { href: "/staff", label: "Personal", icon: Users },
  { href: "/settings", label: "Configuración", icon: Settings },
] as const;

/**
 * Desktop sidebar built on the shadcn `Sidebar` primitive.
 *
 *  - Default: collapsed (icon-only) via `collapsible="icon"`.
 *  - Auto-expands on mouseenter, collapses on mouseleave (controlled
 *    through the shadcn `open` state).
 *  - Top-row pin button (`Pin` / `PinOff`) freezes the expanded state
 *    so it stays open after the cursor leaves.
 */
export function Sidebar() {
  const pathname = usePathname();
  const signOut = useSessionStore((s) => s.signOut);
  const user = useSessionStore((s) => s.user);
  const { open, setOpen } = useSidebar();
  const [pinned, setPinned] = useState(false);

  const handleMouseEnter = useCallback(() => {
    if (!pinned) setOpen(true);
  }, [pinned, setOpen]);

  const handleMouseLeave = useCallback(() => {
    if (!pinned) setOpen(false);
  }, [pinned, setOpen]);

  // Toggle pin state. We call both setPinned and setOpen as independent
  // setState calls (NOT inside the updater function of setPinned) so that
  // we don't trigger React's "setState while rendering another
  // component" warning when SidebarProvider's setOpen is invoked.
  const togglePin = useCallback(() => {
    const nextPinned = !pinned;
    setPinned(nextPinned);
    setOpen(nextPinned);
  }, [pinned, setOpen]);

  return (
    <SidebarPrimitive
      collapsible="icon"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="border-r border-outline-variant"
    >
      <SidebarHeader className="flex-row items-center justify-between gap-2">
        <Brand collapsed={!open} />
        <button
          type="button"
          onClick={togglePin}
          aria-label={pinned ? "Despinchar menú" : "Pinear menú"}
          aria-pressed={pinned}
          title={pinned ? "Menú pineado" : "Click para pinear el menú"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {pinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
        </button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.label}
                  className="group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
                >
                  <Link href={item.href}>
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-2 text-body-sm text-muted-foreground transition-opacity duration-150",
                open ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <span className="min-w-0 truncate" title={user?.email}>
                {user?.email ?? "—"}
              </span>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                void signOut();
              }}
              tooltip="Cerrar sesión"
              className="group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center"
            >
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarPrimitive>
  );
}

/**
 * Mobile top-nav. Kept as a custom component so the brand and primary
 * navigation stay visible without forcing users to open the sheet drawer
 * on small screens.
 */
export function SidebarMobile() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-30 flex h-14 w-full items-center gap-1 border-b border-outline-variant bg-card px-2 md:hidden">
      <span className="font-display px-2 text-base font-bold tracking-tight text-primary">
        {APP_NAME}
      </span>
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
