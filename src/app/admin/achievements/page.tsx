"use client";

import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { 
  Trophy, 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar, 
  Loader2, 
  Award, 
  Star 
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button as UIButton } from "@/components/ui/button";
import { Card as UICard } from "@/components/ui/card";

const Button = UIButton as any;
const Card = UICard as any;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input as UIInput } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge as UIBadge } from "@/components/ui/badge";

const Badge = UIBadge as any;
const Input = UIInput as any;

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  achievement_date: string | null;
  icon: string | null;
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [icon, setIcon] = useState("Trophy");

  const supabase = createClient();

  const fetchAchievements = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .order("achievement_date", { ascending: false });

    if (error) {
      toast.error("Failed to load achievements");
    } else {
      setAchievements(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const handleSave = async () => {
    if (!title) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    const payload = {
      title,
      description,
      achievement_date: date || null,
      icon,
    };

    let error;
    if (editingId) {
      const { error: updateError } = await (supabase.from("achievements") as any)
        .update(payload)
        .eq("id", editingId);
      error = updateError;
    } else {
      const { error: insertError } = await (supabase.from("achievements") as any)
        .insert(payload);
      error = insertError;
    }

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success(editingId ? "Achievement updated" : "Achievement added");
      setIsDialogOpen(false);
      resetForm();
      fetchAchievements();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("achievements").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed");
    } else {
      setAchievements(achievements.filter((a) => a.id !== id));
      toast.success("Achievement removed");
    }
  };

  const startEdit = (achievement: Achievement) => {
    setEditingId(achievement.id);
    setTitle(achievement.title);
    setDescription(achievement.description || "");
    setDate(achievement.achievement_date || "");
    setIcon(achievement.icon || "Trophy");
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setDate("");
    setIcon("Trophy");
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit text-center md:text-left">Professional Achievements</h1>
          <p className="text-muted-foreground text-center md:text-left">Highlight your career milestones, awards, and certifications.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Add Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Achievement" : "Add New Achievement"}</DialogTitle>
              <DialogDescription>
                Details of your professional recognition or milestone.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Title</label>
                <Input 
                  placeholder="Forbes 30 Under 30" 
                  value={title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Date (Optional)</label>
                <Input 
                   type="date"
                   value={date}
                   onChange={(e: ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</label>
                <textarea 
                  className="w-full min-h-[100px] rounded-xl bg-slate-50/50 border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-outfit"
                  placeholder="Tell the story of this achievement..."
                  value={description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Icon Type</label>
                <div className="flex gap-2">
                   {["Trophy", "Award", "Star"].map((iconType) => (
                      <Button 
                        key={iconType}
                        type="button"
                        variant={icon === iconType ? "default" : "outline"}
                        size="sm"
                        onClick={() => setIcon(iconType)}
                        className="flex-1 gap-2"
                      >
                         {iconType === "Trophy" && <Trophy className="w-3.5 h-3.5" />}
                         {iconType === "Award" && <Award className="w-3.5 h-3.5" />}
                         {iconType === "Star" && <Star className="w-3.5 h-3.5" />}
                         {iconType}
                      </Button>
                   ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full font-bold gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? "Saving..." : editingId ? "Update Achievement" : "Add Achievement"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : achievements.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((a) => (
            <Card key={a.id} className="group p-6 border-slate-200 hover:shadow-lg transition-all relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/5" onClick={() => startEdit(a)}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => handleDelete(a.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
               </div>
               
               <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    {a.icon === "Trophy" && <Trophy className="w-6 h-6" />}
                    {a.icon === "Award" && <Award className="w-6 h-6" />}
                    {a.icon === "Star" && <Star className="w-6 h-6" />}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {a.achievement_date && (
                        <Badge variant="outline" className="bg-slate-50 text-[10px] font-bold border-slate-100 flex gap-1 items-center">
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(a.achievement_date).getFullYear()}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">{a.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">{a.description}</p>
                  </div>
               </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
           <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-slate-300" />
           </div>
           <h3 className="font-bold text-slate-900 text-lg">No achievements yet</h3>
           <p className="text-muted-foreground text-sm max-w-[250px] text-center mt-1">
             Add your first professional milestone to showcase your expertise.
           </p>
        </div>
      )}
    </div>
  );
}
