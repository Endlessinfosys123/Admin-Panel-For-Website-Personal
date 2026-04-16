"use client";

import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { 
  Target, 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar, 
  Loader2, 
  CheckCircle2, 
  Circle,
  Clock
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
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  status: 'todo' | 'in_progress' | 'done';
  deadline: string | null;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>("todo");
  const [deadline, setDeadline] = useState("");

  const supabase = createClient();

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load goals");
    } else {
      setGoals(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleSave = async () => {
    if (!title) {
      toast.error("Title is required");
      return;
    }

    setSaving(true);
    const payload = {
      title,
      description,
      status,
      deadline: deadline || null,
    };

    let error;
    if (editingId) {
      const { error: updateError } = await (supabase.from("goals") as any)
        .update(payload)
        .eq("id", editingId);
      error = updateError;
    } else {
      const { error: insertError } = await (supabase.from("goals") as any)
        .insert(payload);
      error = insertError;
    }

    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success(editingId ? "Goal updated" : "Goal added");
      setIsDialogOpen(false);
      resetForm();
      fetchGoals();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed");
    } else {
      setGoals(goals.filter((g) => g.id !== id));
      toast.success("Goal removed");
    }
  };

  const startEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setTitle(goal.title);
    setDescription(goal.description || "");
    setStatus(goal.status);
    setDeadline(goal.deadline || "");
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setStatus("todo");
    setDeadline("");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <Circle className="w-4 h-4 text-slate-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case 'in_progress': return "bg-amber-50 text-amber-700 border-amber-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit text-center md:text-left">Strategic Goals</h1>
          <p className="text-muted-foreground text-center md:text-left">Track your business growth and vision milestones for 2026.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Goal" : "Add New Goal"}</DialogTitle>
              <DialogDescription>
                Define a clear objective for your personal brand.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Input 
                  placeholder="Launch AI Consulting Arm" 
                  value={title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Deadline (Optional)</label>
                <Input 
                  type="date"
                  value={deadline}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setDeadline(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Description</label>
                <textarea 
                  className="w-full min-h-[100px] rounded-xl bg-slate-50/50 border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-outfit"
                  placeholder="What specifically do you want to achieve?"
                  value={description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Priority Status</label>
                <div className="flex gap-2">
                   {["todo", "in_progress", "done"].map((s) => (
                      <Button 
                        key={s}
                        type="button"
                        variant={status === s ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatus(s as any)}
                        className="flex-1 capitalize"
                      >
                         {s.replace("_", " ")}
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
                {saving ? "Saving..." : editingId ? "Update Goal" : "Create Goal"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : goals.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {goals.map((g) => (
            <Card key={g.id} className="p-6 border-slate-200 hover:shadow-md transition-all relative group">
               <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5 flex gap-1 items-center border", getStatusColor(g.status))}>
                           {getStatusIcon(g.status)}
                           {g.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        {g.deadline && (
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                             <Calendar className="w-3 h-3" />
                             {new Date(g.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">{g.title}</h3>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => startEdit(g)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDelete(g.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
               </div>
               
               {g.description && (
                 <p className="text-sm text-muted-foreground ml-14 leading-relaxed line-clamp-2">{g.description}</p>
               )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
           <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-slate-300" />
           </div>
           <h3 className="font-bold text-slate-900 text-lg">No active goals</h3>
           <p className="text-muted-foreground text-sm max-w-[250px] text-center mt-1">
             Add your first business objective and start tracking your vision.
           </p>
        </div>
      )}
    </div>
  );
}
