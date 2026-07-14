import { AuthGuard } from "@/components/auth/AuthGuard";
import { Sidebar, SidebarMobile } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <SidebarMobile />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}