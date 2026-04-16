"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  User, 
  Mail, 
  Shield, 
  Camera, 
  Loader2, 
  Save, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { Button as UIButton } from "@/components/ui/button";
import { Input as UIInput } from "@/components/ui/input";
import { Card as UICard, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const Button = UIButton as any;
const Input = UIInput as any;
const Card = UICard as any;

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase
        .from("profiles") as any)
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      const profileData = data as any;
      setProfile({ ...profileData, email: user.email });
      setFullName(profileData.full_name || "");
      setAvatarUrl(profileData.avatar_url || "");
    } catch (error: any) {
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const { error } = await (supabase
        .from("profiles") as any)
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (event: any) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${profile.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success("Avatar uploaded! Remember to save changes.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and account settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Quick Info */}
        <div className="space-y-6">
          <Card className="border-slate-200 overflow-hidden">
            <CardHeader className="bg-slate-50/50 pb-8 text-center pt-8">
              <div className="relative inline-block mx-auto">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-lg shadow-slate-200/50">
                   {avatarUrl ? (
                     <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     <User className="w-12 h-12 text-slate-300" />
                   )}
                </div>
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary/90 cursor-pointer transition-all border-4 border-white group"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  )}
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="mt-4">
                <h2 className="font-bold text-slate-900 text-lg">{fullName || "Admin User"}</h2>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{profile?.role}</p>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
               <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600 truncate">{profile?.email}</span>
               </div>
               <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-600">Access: Super Admin</span>
               </div>
            </CardContent>
          </Card>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-emerald-800">
             <CheckCircle2 className="w-5 h-5 shrink-0" />
             <div className="text-xs space-y-1">
               <p className="font-bold">Identity Verified</p>
               <p className="font-medium opacity-80">Your account is fully secured with role-based access control.</p>
             </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your public information and how it appears in history logs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                  <Input 
                    placeholder="Enter your name" 
                    value={fullName}
                    onChange={(e: any) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email (Read Only)</label>
                  <Input 
                    value={profile?.email}
                    disabled
                    className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Profile Photo URL</label>
                <Input 
                  placeholder="https://..." 
                  value={avatarUrl}
                  onChange={(e: any) => setAvatarUrl(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground ml-1">You can upload a photo or paste a direct URL here.</p>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 justify-end py-4 px-6 border-t border-slate-100">
               <Button 
                 onClick={handleUpdateProfile} 
                 disabled={saving}
                 className="font-bold gap-2 shadow-lg shadow-primary/20 min-w-[140px]"
               >
                 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                 {saving ? "Saving Changes..." : "Save Profile"}
               </Button>
            </CardFooter>
          </Card>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-800">
             <AlertCircle className="w-5 h-5 shrink-0" />
             <div className="text-xs space-y-1">
               <p className="font-bold">Security Tip: Strong Passwords</p>
               <p className="font-medium opacity-80">Regularly update your login password through the main portal to ensure your administrative account remains protected.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
