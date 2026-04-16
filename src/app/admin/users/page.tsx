"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Shield, 
  Mail, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Loader2,
  Lock,
  UserCheck
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card as UICard, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input as UIInput } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Card = UICard as any;
const Input = UIInput as any;

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await (supabase.from("profiles") as any).select("*");
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Fetching administrative cast...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Administrative Cast</h1>
          <p className="text-muted-foreground">Manage roles and permissions for brand managers and editors.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <Button className="font-bold gap-2 shadow-lg shadow-primary/20">
              <UserPlus className="w-4 h-4" /> Invite Manager
           </Button>
        </div>
      </div>

      <Card className="border-slate-200">
         <CardHeader className="border-b border-slate-50 py-4">
            <div className="flex flex-col md:flex-row justify-between gap-4">
               <div className="relative max-w-sm w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input 
                    placeholder="Search managers..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e: any) => setSearchTerm(e.target.value)}
                  />
               </div>
               <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <UserCheck className="w-4 h-4" /> {users.length} Active Profiles
               </div>
            </div>
         </CardHeader>
         <CardContent className="p-0">
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Identity</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Strategic Role</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Security</th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Last Active</th>
                        <th className="px-6 py-4 w-10"></th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-slate-200 shadow-sm">
                                    {user.avatar_url ? (
                                      <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                      user.full_name?.substring(0, 2).toUpperCase() || "AD"
                                    )}
                                 </div>
                                 <div className="min-w-0">
                                    <p className="font-bold text-slate-900 truncate">{user.full_name || "New Manager"}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email || "No email available"}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold uppercase text-[10px]">
                                 {user.role}
                              </Badge>
                           </td>
                           <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-emerald-600">
                                 <Shield className="w-3.5 h-3.5" />
                                 <span className="text-[10px] font-bold uppercase tracking-widest">Authorized</span>
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <span className="text-xs text-slate-400 font-bold uppercase tracking-tight">
                                 {new Date(user.updated_at).toLocaleDateString()}
                              </span>
                           </td>
                           <td className="px-6 py-4">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                 <MoreVertical className="w-4 h-4" />
                              </Button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
            {filteredUsers.length === 0 && (
               <div className="py-20 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                     <Users className="w-8 h-8 text-slate-200" />
                  </div>
                  <h3 className="font-bold text-slate-900">No managers found</h3>
                  <p className="text-sm text-slate-400">Try refining your search criteria.</p>
               </div>
            )}
         </CardContent>
      </Card>

      <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4 text-amber-800">
         <Lock className="w-6 h-6 shrink-0" />
         <div className="space-y-1">
            <h3 className="font-bold">Administrative Security Protocol</h3>
            <p className="text-sm opacity-80 leading-relaxed max-w-3xl">
               Only the Founder & CEO (Tishykumar Patel) has the authority to invite and modify higher-level administrative cast members. Changes here affect platform-wide access for Quantifyre brand operations.
            </p>
         </div>
      </div>
    </div>
  );
}
