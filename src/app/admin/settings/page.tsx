"use client";

import { useState } from "react";
import { 
  Settings, 
  Globe, 
  Mail, 
  Shield, 
  Bell, 
  Database, 
  History,
  Save,
  Loader2,
  Lock,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { Card as UICard, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input as UIInput } from "@/components/ui/input";
import { Button as UIButton } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

const Card = UICard as any;
const Input = UIInput as any;
const Button = UIButton as any;

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Platform settings updated successfully");
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Platform Settings</h1>
          <p className="text-muted-foreground">Configure the global behavior and environment of the Tishykumar Patel ecosystem.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <Button onClick={handleSave} disabled={saving} className="font-bold gap-2 shadow-lg shadow-primary/20 min-w-[140px]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Visibility"}
           </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-slate-50 border border-slate-200 p-1 h-auto rounded-xl">
           <TabsTrigger value="general" className="rounded-lg py-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Globe className="w-4 h-4 mr-2" /> General
           </TabsTrigger>
           <TabsTrigger value="security" className="rounded-lg py-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Shield className="w-4 h-4 mr-2" /> Security
           </TabsTrigger>
           <TabsTrigger value="notifications" className="rounded-lg py-2 px-4 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Bell className="w-4 h-4 mr-2" /> Communications
           </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
           <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-slate-200">
                 <CardHeader>
                    <CardTitle className="text-lg">Visibility Configuration</CardTitle>
                    <CardDescription>Public brand identity details.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Site Title</label>
                       <Input defaultValue="Tishykumar Patel | Founder & CEO" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Brand SEO Keyword</label>
                       <Input defaultValue="AI, Cybersecurity, Entrepreneurship" />
                    </div>
                    <div className="pt-4 flex items-center justify-between">
                       <div>
                          <p className="text-sm font-bold text-slate-900">Maintenance Mode</p>
                          <p className="text-xs text-muted-foreground">Redirect all public traffic to a holding page.</p>
                       </div>
                       <Switch />
                    </div>
                 </CardContent>
              </Card>

              <Card className="border-slate-200">
                 <CardHeader>
                    <CardTitle className="text-lg">Platform Infrastructure</CardTitle>
                    <CardDescription>Core backend and external integrations.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Database className="w-5 h-5 text-primary" />
                          <div>
                             <p className="text-xs font-bold text-slate-900">Supabase Engine</p>
                             <p className="text-[10px] text-slate-400 uppercase tracking-widest">v2.45.1 Operational</p>
                          </div>
                       </div>
                       <ExternalLink className="w-4 h-4 text-slate-300" />
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <History className="w-5 h-5 text-primary" />
                          <div>
                             <p className="text-xs font-bold text-slate-900">GitHub Synchronization</p>
                             <p className="text-[10px] text-slate-400 uppercase tracking-widest">Last synced 2h ago</p>
                          </div>
                       </div>
                       <ExternalLink className="w-4 h-4 text-slate-300" />
                    </div>
                 </CardContent>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
           <Card className="border-slate-200 max-w-2xl mx-auto">
              <CardHeader>
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Strategic Security Layer</CardTitle>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 </div>
                 <CardDescription>Encryption and access control protocols.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                       <div>
                          <p className="text-sm font-bold text-slate-900">Two-Factor Authentication</p>
                          <p className="text-xs text-muted-foreground">Require an additional code for administrative access.</p>
                       </div>
                       <Switch checked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                       <div>
                          <p className="text-sm font-bold text-slate-900">IP Whitelisting</p>
                          <p className="text-xs text-muted-foreground">Restrict login to specific professional locations.</p>
                       </div>
                       <Switch />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                       <div>
                          <p className="text-sm font-bold text-slate-900">Auto-Termination</p>
                          <p className="text-xs text-muted-foreground">Log out after 30 minutes of administrative inactivity.</p>
                       </div>
                       <Switch checked />
                    </div>
                 </div>
              </CardContent>
              <CardFooter className="bg-red-50/50 border-t border-red-50 rounded-b-xl py-4 flex gap-4">
                 <Lock className="w-5 h-5 text-red-500 shrink-0" />
                 <p className="text-xs text-red-800 font-medium">Security changes are high-impact and require a master session re-authentication.</p>
              </CardFooter>
           </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
           <Card className="border-slate-200">
              <CardHeader>
                 <CardTitle className="text-lg">Strategic Communications</CardTitle>
                 <CardDescription>Configure how you receive leads and system alerts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                       <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-2">Engagement Alerts</h3>
                       <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">New Contact Form Lead</span>
                          <Switch checked />
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">New Blog Comment</span>
                          <Switch checked />
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Social Mention Detected</span>
                          <Switch />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-2">System Health</h3>
                       <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Storage Capacity Limit</span>
                          <Switch checked />
                       </div>
                       <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">API Latency Warning</span>
                          <Switch />
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
