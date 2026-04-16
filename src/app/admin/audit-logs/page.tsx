"use client";

import { useState, useEffect } from "react";
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Layers, 
  Loader2,
  AlertCircle,
  FileText,
  ImageIcon,
  ShieldAlert,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card as UICard, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input as UIInput } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Card = UICard as any;
const Input = UIInput as any;

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes("Create") || action.includes("Published")) return <Plus className="w-3.5 h-3.5 text-emerald-500" />;
    if (action.includes("Update") || action.includes("Edited")) return <Edit className="w-3.5 h-3.5 text-blue-500" />;
    if (action.includes("Delete") || action.includes("Removed")) return <Trash2 className="w-3.5 h-3.5 text-red-500" />;
    return <AlertCircle className="w-3.5 h-3.5 text-slate-400" />;
  };

  const getModuleIcon = (module: string) => {
    switch (module?.toLowerCase()) {
      case "blogs": return <FileText className="w-4 h-4" />;
      case "gallery": return <ImageIcon className="w-4 h-4" />;
      case "security": return <ShieldAlert className="w-4 h-4" />;
      default: return <Layers className="w-4 h-4" />;
    }
  };

  const filteredLogs = logs.filter(l => 
    l.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.module?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Reconstructing administrative history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Strategic Activity Log</h1>
           <p className="text-muted-foreground">Trace historical administrative actions across the Quantifyre ecosystem.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="outline" className="font-bold gap-2">
              <Filter className="w-4 h-4" /> Filter History
           </Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
         <CardHeader className="border-b border-slate-50 py-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
               <div className="relative max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search logs by action or module..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e: any) => setSearchTerm(e.target.value)}
                  />
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <History className="w-4 h-4" /> {logs.length} Historical Records
               </div>
            </div>
         </CardHeader>
         <CardContent className="p-0">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Timestamp</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Action</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Strategic Module</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Outcome</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/30 transition-colors">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-slate-400 font-medium">
                                 <Calendar className="w-3.5 h-3.5" />
                                 <span className="text-[10px] uppercase font-bold tracking-widest">
                                    {new Date(log.created_at).toLocaleString()}
                                 </span>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex flex-col">
                                 <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                                    {getActionIcon(log.action)}
                                    {log.action}
                                 </div>
                                 <p className="text-[10px] text-slate-400 font-medium mt-0.5">{log.description || "System level record"}</p>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                    {getModuleIcon(log.module)}
                                 </div>
                                 <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">{log.module || "Core"}</span>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px] font-bold">
                                 SUCCESS
                              </Badge>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            {filteredLogs.length === 0 && (
               <div className="py-24 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                     <History className="w-8 h-8 text-slate-200" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">Administrative void</h3>
                  <p className="text-sm text-slate-400 max-w-[250px] mx-auto">No logs have been recorded for this criteria yet.</p>
               </div>
            )}
         </CardContent>
      </Card>

      <div className="bg-slate-900 text-white rounded-3xl p-6 flex gap-4 overflow-hidden relative">
         <ShieldAlert className="w-6 h-6 shrink-0 text-primary" />
         <div className="space-y-1 relative z-10">
            <h3 className="font-bold uppercase tracking-tight">Audit Persistence Protocol</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
               Historical logs are immutable and cryptographically linked to the performing administrator's session. These records are retained for dynamic platform compliance and strategic transparency.
            </p>
         </div>
         <History className="absolute -bottom-10 -right-10 w-40 h-40 text-white/5 -rotate-12" />
      </div>
    </div>
  );
}
