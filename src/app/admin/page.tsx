import Link from "next/link";
import { 
  FileText, 
  ImageIcon, 
  Trophy, 
  Target, 
  MessageSquare,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import { DashboardChart } from "@/components/admin/DashboardChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const supabase = createClient();

  // Fetch real counts from Supabase
  const [
    { count: blogCount },
    { count: galleryCount },
    { count: achievementCount },
    { count: architectureCount },
    { count: messageCount },
    { data: recentBlogs },
    { data: recentGallery },
    { data: blogsForChart }
  ] = await Promise.all([
    supabase.from("blogs").select("*", { count: "exact", head: true }),
    supabase.from("gallery").select("*", { count: "exact", head: true }),
    supabase.from("achievements").select("*", { count: "exact", head: true }),
    supabase.from("goals").select("*", { count: "exact", head: true }),
    supabase.from("messages").select("*", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("blogs").select("title, created_at").order("created_at", { ascending: false }).limit(3) as any,
    supabase.from("gallery").select("created_at").order("created_at", { ascending: false }).limit(2) as any,
    supabase.from("blogs").select("created_at") as any
  ]);

  // Process chart data (last 6 months)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartDataMap: Record<string, number> = {};
  
  // Initialize last 6 months with 0
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    chartDataMap[monthNames[d.getMonth()]] = 0;
  }

  (blogsForChart || []).forEach((blog: any) => {
    const date = new Date(blog.created_at);
    const month = monthNames[date.getMonth()];
    if (chartDataMap[month] !== undefined) {
      chartDataMap[month]++;
    }
  });

  const chartData = Object.entries(chartDataMap).map(([name, posts]) => ({ name, posts }));

  // Process activity log
  const activities = [
    ...(recentBlogs || []).map((b: any) => ({ 
      type: "Blog Published", 
      title: b.title, 
      date: new Date(b.created_at),
      icon: FileText
    })),
    ...(recentGallery || []).map((g: any) => ({ 
      type: "Gallery Updated", 
      title: "New visual assets added", 
      date: new Date(g.created_at),
      icon: ImageIcon
    })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  const stats = [
    { label: "Total Blogs", value: blogCount || 0, icon: FileText, change: "Check Blog Feed", color: "text-blue-600", bg: "bg-blue-100", href: "/admin/blogs" },
    { label: "Gallery Images", value: galleryCount || 0, icon: ImageIcon, change: "Manage Images", color: "text-purple-600", bg: "bg-purple-100", href: "/admin/gallery" },
    { label: "Achievements", value: achievementCount || 0, icon: Trophy, change: "Updates Portfolio", color: "text-yellow-600", bg: "bg-yellow-100", href: "/admin/achievements" },
    { label: "Active Goals", value: architectureCount || 0, icon: Target, change: "Strategic Vision", color: "text-emerald-600", bg: "bg-emerald-100", href: "/admin/goals" },
    { label: "Unread Messages", value: messageCount || 0, icon: MessageSquare, change: "Customer Leads", color: "text-red-500", bg: "bg-red-50", href: "/admin/contacts" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-1">
        <h2 className="text-4xl font-bold tracking-tight text-slate-900 font-outfit">Welcome back, Tishy!</h2>
        <p className="text-muted-foreground font-medium">Here's a live overview of your brand's digital ecosystem.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group h-full">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900 font-outfit">{stat.value}</p>
                <div className="flex items-center gap-1.5 pt-1">
                   <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400/80">{stat.change}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Activity Card */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-8 overflow-hidden relative">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Platform Activity</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latest updates from your site</p>
              </div>
            </div>
            <Link href="/admin/blogs">
              <Button variant="ghost" className="text-xs font-bold text-primary hover:bg-primary/5">View Full History</Button>
            </Link>
          </div>
          
          <div className="space-y-6">
            {activities.length > 0 ? activities.map((activity, i) => (
              <div key={i} className="flex gap-4 items-center pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                  <activity.icon className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="space-y-0.5 overflow-hidden flex-1">
                  <p className="text-sm text-slate-600 leading-tight">
                    <span className="font-bold text-slate-900">{activity.type}</span>: {activity.title}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                    {Math.floor((new Date().getTime() - activity.date.getTime()) / (1000 * 60 * 60))} hours ago
                  </p>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
              </div>
            )) : (
              <p className="text-sm text-slate-400 text-center py-10">No recent activity detected.</p>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="lg:col-span-3 space-y-6">
           <div className="bg-primary text-white rounded-3xl shadow-xl shadow-primary/20 p-8 overflow-hidden relative group">
              <div className="relative z-10">
                <h3 className="font-extrabold text-2xl mb-2 font-outfit uppercase tracking-tight">Growth Hub</h3>
                <p className="text-white/70 text-sm mb-8 font-medium leading-relaxed">Expand your digital footprint. Start a new technical blog or update your vision.</p>
                <div className="grid grid-cols-1 gap-3">
                  <Link href="/admin/blogs/new">
                    <Button className="w-full bg-white text-primary font-bold py-6 rounded-2xl text-md hover:bg-slate-50 transition-all active:scale-[0.98]">
                      Create New Story
                    </Button>
                  </Link>
                  <Link href="/admin/gallery">
                    <Button variant="outline" className="w-full bg-white/5 text-white font-bold py-6 border-white/20 rounded-2xl text-md hover:bg-white/10 transition-all active:scale-[0.98]">
                      Manage Gallery
                    </Button>
                  </Link>
                </div>
              </div>
              <Rocket className="absolute -bottom-12 -right-12 w-48 h-48 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
           </div>

           {/* Performance Card */}
           <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 text-lg">Visibility Index</h3>
                <Badge className="bg-emerald-500 text-[10px] font-extrabold uppercase">Live</Badge>
              </div>
              <DashboardChart data={chartData} />
              <div className="mt-6 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                 <span>Frequency of Updates</span>
                 <span className="text-primary">Dynamic Feed</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
