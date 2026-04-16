import { Sidebar } from "@/components/admin/Sidebar";
import { type Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Panel | Tishykumar Patel",
  description: "Founder & CEO personal brand management dashboard",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Fixed width component */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 ml-[260px] min-h-screen flex flex-col">
        {/* Top Header Placeholder */}
        <header className="h-16 border-b border-slate-200 bg-white sticky top-0 z-10 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-slate-900">Admin</span>
            <span>/</span>
            <span>Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
              TP
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
