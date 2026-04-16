"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Trophy,
  Target,
  Rocket,
  BarChart3,
  Mail,
  Users,
  Settings,
  ClipboardList,
  User,
  LogOut,
  Loader2,
} from "lucide-react";

const sidebarItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Blog Posts", href: "/admin/blogs", icon: FileText },
  { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { name: "Achievements", href: "/admin/achievements", icon: Trophy },
  { name: "Goals", href: "/admin/goals", icon: Target },
  { name: "Future Plans", href: "/admin/future-plans", icon: Rocket },
  { name: "Stats", href: "/admin/stats", icon: BarChart3 },
  { name: "Contact Messages", href: "/admin/contacts", icon: Mail, badge: "unread" },
  { name: "User Management", href: "/admin/users", icon: Users, superAdminOnly: true },
  { name: "Settings", href: "/admin/settings", icon: Settings, superAdminOnly: true },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: ClipboardList, superAdminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error loading sidebar profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
      setLoggingOut(false);
    }
  };

  return (
    <aside className="w-[260px] bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-slate-100 mb-4">
        <h1 className="text-xl font-bold text-primary">Tishykumar Patel</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Founder & CEO Admin</p>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = item.href === "/admin" 
            ? pathname === "/admin" 
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
              {item.badge === "unread" && (
                <span className="ml-auto w-2 h-2 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2">
           {loading ? (
             <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse" />
           ) : (
             <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-slate-200 shadow-sm">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile?.full_name?.substring(0, 2).toUpperCase() || "AD"
                )}
             </div>
           )}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate leading-tight">
              {loading ? "..." : (profile?.full_name || "Admin User")}
            </span>
            <span className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-tight">
              {loading ? "..." : (profile?.role || "Manager")}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          <Link
            href="/admin/profile"
            className="flex items-center justify-center gap-2 py-2 px-3 text-[10px] font-bold uppercase bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <User className="w-3.5 h-3.5" /> Profile
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center justify-center gap-2 py-2 px-3 text-[10px] font-bold uppercase bg-white border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
          >
            {loggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
