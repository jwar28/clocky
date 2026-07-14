import { PublicHeader } from "@/components/layout/PublicHeader";

/**
 * Public layout — NO AuthGuard, NO sidebar.
 * Used by routes that should be accessible without authentication
 * (e.g. /equipo for team members to consult their schedule).
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}