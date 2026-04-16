"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  Award,
  Eye,
  MousePointer2,
  Share2,
  Calendar,
  Loader2,
  Info
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card as UICard, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DashboardChart } from "@/components/admin/DashboardChart";

const Card = UICard as any;

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [
        { count: blogs },
        { count: gallery },
        { count: achievements },
        { count: goals },
        { count: messages },
        { data: blogData }
      ] = await Promise.all([
        supabase.from("blogs").select("*", { count: "exact", head: true }),
        supabase.from("gallery").select("*", { count: "exact", head: true }),
        supabase.from("achievements").select("*", { count: "exact", head: true }),
        supabase.from("goals").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("blogs").select("created_at") as any
      ]);

      // Process chart data
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const chartMap: Record<string, number> = {};
      monthNames.forEach(m => chartMap[m] = 0);
      
      blogData?.forEach((b: any) => {
        const m = monthNames[new Date(b.created_at).getMonth()];
        chartMap[m]++;
      });
      const chartData = Object.entries(chartMap).map(([name, posts]) => ({ name, posts }));

      setStats({
        blogs,
        gallery,
        achievements,
        goals,
        messages,
        chartData
      });
    } catch (error) {
      console.error("Error fetching stats", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Aggregating real-time metrics...</p>
      </div>
    );
  }

  const kpis = [
    { label: "Content Volume", value: (stats?.blogs || 0) + (stats?.gallery || 0), icon: BarChart3, color: "text-blue-600", bg: "bg-blue-100", desc: "Total published digital assets" },
    { label: "Global Impact", value: stats?.achievements || 0, icon: Award, color: "text-purple-600", bg: "bg-purple-100", desc: "Professional milestones tracked" },
    { label: "Strategic Focus", value: `${Math.round(((stats?.goals || 0) / 10) * 100)}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100", desc: "Completion of annual vision" },
    { label: "Network Growth", value: stats?.messages || 0, icon: Users, color: "text-amber-600", bg: "bg-amber-100", desc: "Inbound collaboration inquiries" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Performance Analytics</h1>
        <p className="text-muted-foreground">Historical data and engagement metrics for the Tishykumar Patel brand.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-slate-200">
            <CardContent className="pt-6">
               <div className="flex justify-between items-start mb-4">
                 <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                   <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                 </div>
                 <Info className="w-4 h-4 text-slate-300" />
               </div>
               <div className="space-y-1">
                 <p className="text-3xl font-extrabold tracking-tight text-slate-900 font-outfit">{kpi.value}</p>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                 <p className="text-[10px] text-slate-400 font-medium pt-2">{kpi.desc}</p>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         <Card className="border-slate-200 lg:col-span-1">
            <CardHeader>
               <CardTitle className="text-lg">Content Velocity</CardTitle>
               <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">Publication frequency across 12 months</p>
            </CardHeader>
            <CardContent className="pt-4">
               <DashboardChart data={stats?.chartData} />
            </CardContent>
            <CardFooter className="justify-center border-t border-slate-50 bg-slate-50/50 py-3">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex gap-2 items-center">
                  <Calendar className="w-3 h-3" /> Updated: {new Date().toLocaleDateString()}
               </span>
            </CardFooter>
         </Card>

         <div className="space-y-6">
            <Card className="border-slate-200">
               <CardHeader>
                  <CardTitle className="text-lg">Visibility Benchmarks</CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                        <span>Digital Presence</span>
                        <span>85%</span>
                     </div>
                     <Progress value={85} className="h-1.5" />
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                        <span>SEO Health</span>
                        <span>72%</span>
                     </div>
                     <Progress value={72} className="h-1.5" />
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-500">
                        <span>Lead Conversion</span>
                        <span>48%</span>
                     </div>
                     <Progress value={48} className="h-1.5" />
                  </div>
               </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4">
               <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                  <Eye className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-slate-900">12k</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Impressions</p>
               </div>
               <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                  <MousePointer2 className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-slate-900">3.4%</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">CTR</p>
               </div>
               <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
                  <Share2 className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                  <p className="text-lg font-bold text-slate-900">890</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Social Shares</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
