import type { Metadata } from "next";
import { Overpass } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const overpass = Overpass({
  subsets: ["latin"],
  variable: "--font-overpass",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clocky — Malla Horaria",
  description: "Gestión y control de la malla horaria semanal del equipo de operaciones.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={overpass.variable}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <TooltipProvider delayDuration={150} skipDelayDuration={300}>
          {children}
        </TooltipProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}