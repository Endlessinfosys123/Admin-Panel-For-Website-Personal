"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar, 
  Loader2, 
  Rocket,
  CheckCircle2,
  Circle,
  Clock,
  Zap,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button as UIButton } from "@/components/ui/button";
import { Card as UICard } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

const Button = UIButton as any;
const Card = UICard as any;
const Badge = UIBadge as any;
const Input = UIInput as any;

interface FuturePlan {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  priority: 'low' | 'medium' | 'high';
  is_completed: boolean;
}

export default function FuturePlansPage() {
  const [plans, setPlans] = useState<FuturePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>("medium");
  const [isCompleted, setIsCompleted] = useState(false);

  const supabase = createClient();

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("future_plans")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load roadmap");
    } else {
      setPlans(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSave = async () => {
    if (!title) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    const payload = {
      title,
      description,
      target_date: targetDate || null,
      priority,
      is_completed: isCompleted,
    };

    let error;
    if (editingId) {
      const { error: updateError } = await (supabase.from("future_plans") as any)
        .update(payload)
        .eq("id", editingId);
      error = updateError;
    } else {
      const { error: insertError } = await (supabase.from("future_plans") as any)
        .insert(payload);
      error = insertError;
    }

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success(editingId ? "Plan updated" : "Plan added to roadmap");
      setIsDialogOpen(false);
      resetForm();
      fetchPlans();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("future_plans").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed");
    } else {
      setPlans(plans.filter((p) => p.id !== id));
      toast.success("Plan removed from roadmap");
    }
  };

  const toggleComplete = async (plan: FuturePlan) => {
     const { error } = await (supabase.from("future_plans") as any)
       .update({ is_completed: !plan.is_completed })
       .eq("id", plan.id);
     
     if (!error) {
       setPlans(plans.map(p => p.id === plan.id ? { ...p, is_completed: !p.is_completed } : p));
     }
  };

  const startEdit = (plan: FuturePlan) => {
    setEditingId(plan.id);
    setTitle(plan.title);
    setDescription(plan.description || "");
    setTargetDate(plan.target_date || "");
    setPriority(plan.priority);
    setIsCompleted(plan.is_completed);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setTargetDate("");
    setPriority("medium");
    setIsCompleted(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return "bg-red-50 text-red-700 border-red-100";
      case 'low': return "bg-slate-50 text-slate-600 border-slate-100";
      default: return "bg-amber-50 text-amber-700 border-amber-100";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit text-center md:text-left flex items-center gap-3">
             <Rocket className="w-8 h-8 text-primary" /> Future Roadmap
          </h1>
          <p className="text-muted-foreground text-center md:text-left">Strategic long-term vision and upcoming platform expansions.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Add Multi-Year Vision
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Roadmap Item" : "Create Visionary Objective"}</DialogTitle>
              <DialogDescription>
                Define a future milestone for the Tishykumar Patel brand.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Input 
                  placeholder="2027: AI Infrastructure Launch" 
                  value={title}
                  onChange={(e: any) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Estimated Window</label>
                <Input 
                  placeholder="e.g. Q4 2026 or 2027"
                  value={targetDate}
                  onChange={(e: any) => setTargetDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Strategic Description</label>
                <textarea 
                  className="w-full min-h-[100px] rounded-xl bg-slate-50/50 border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-outfit"
                  placeholder="How does this contribute to long-term growth?"
                  value={description}
                  onChange={(e: any) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Priority</label>
                    <select 
                      className="w-full rounded-xl bg-slate-50/50 border border-slate-200 p-2.5 text-sm"
                      value={priority}
                      onChange={(e: any) => setPriority(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                 </div>
                 <div className="flex items-end pb-1 gap-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600 cursor-pointer">
                       <input 
                         type="checkbox" 
                         checked={isCompleted} 
                         onChange={(e) => setIsCompleted(e.target.checked)}
                         className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                       Completed?
                    </label>
                 </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full font-bold gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {saving ? "Saving..." : editingId ? "Update Milestone" : "Commit to Roadmap"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      ) : plans.length > 0 ? (
        <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pl-8 py-4">
          {plans.map((p) => (
            <div key={p.id} className="relative">
               <div className={cn(
                 "absolute -left-[41px] top-4 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10",
                 p.is_completed ? "bg-emerald-500" : "bg-slate-200"
               )} />
               
               <Card className={cn(
                 "p-6 border-slate-200 hover:shadow-lg transition-all group relative overflow-hidden",
                 p.is_completed && "bg-slate-50/50 border-slate-100 opacity-80"
               )}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                     <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5 border uppercase", getPriorityColor(p.priority))}>
                              {p.priority} Priority
                           </Badge>
                           {p.target_date && (
                             <Badge variant="secondary" className="bg-slate-100 text-[10px] font-bold text-slate-500 border-none">
                                <Calendar className="w-3 h-3 mr-1" /> {p.target_date}
                             </Badge>
                           )}
                           {p.is_completed && (
                             <Badge className="bg-emerald-500 text-[10px] font-bold text-white border-none">
                                COMPLETED
                             </Badge>
                           )}
                        </div>
                        <h3 className={cn("text-xl font-bold font-outfit", p.is_completed ? "text-slate-500 line-through" : "text-slate-900 line-clamp-1")}>
                          {p.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{p.description}</p>
                     </div>
                     
                     <div className="flex items-center gap-2 shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={cn("font-bold gap-2", p.is_completed ? "text-emerald-500 hover:bg-emerald-50" : "text-slate-400 hover:bg-slate-50")}
                          onClick={() => toggleComplete(p)}
                        >
                           {p.is_completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                           {p.is_completed ? "Done" : "Mark Done"}
                        </Button>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => startEdit(p)}>
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDelete(p.id)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                     </div>
                  </div>
               </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/30">
           <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Rocket className="w-8 h-8 text-slate-300" />
           </div>
           <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">The Future Awaits</h3>
           <p className="text-muted-foreground text-sm max-w-[250px] text-center mt-1 font-medium">
             Your roadmap is empty. Map out your next decade of technical and entrepreneurial dominance.
           </p>
           <Button variant="outline" className="mt-6 border-slate-200 font-bold gap-2" onClick={() => setIsDialogOpen(true)}>
              Initialize Strategy <ArrowRight className="w-4 h-4" />
           </Button>
        </div>
      )}
    </div>
  );
}
