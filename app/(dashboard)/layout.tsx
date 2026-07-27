import { AuthGuard } from "@/components/auth/AuthGuard";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar, SidebarMobile } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider
        style={
          { "--sidebar-width": "260px", "--sidebar-width-icon": "4rem" } as React.CSSProperties
        }
      >
        <div className="flex min-h-screen w-full bg-background">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <SidebarMobile />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
