"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Mail, 
  Trash2, 
  Eye, 
  Loader2, 
  User, 
  MessageSquare, 
  Clock,
  MailOpen,
  Reply
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Card as UICard } from "@/components/ui/card";
import { Button as UIButton } from "@/components/ui/button";

const Card = UICard as any;
const Button = UIButton as any;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge as UIBadge } from "@/components/ui/badge";

const Badge = UIBadge as any;

interface Message {
  id: string;
  created_at: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
}

export default function ContactsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const supabase = createClient();

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load messages");
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleRead = async (message: Message) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
    
    if (!message.is_read) {
      const { error } = await (supabase.from("messages") as any)
        .update({ is_read: true })
        .eq("id", message.id);
      
      if (!error) {
        setMessages(messages.map(m => m.id === message.id ? { ...m, is_read: true } : m));
      }
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) {
      toast.error("Delete failed");
    } else {
      setMessages(messages.filter((m) => m.id !== id));
      toast.success("Message deleted");
      if (selectedMessage?.id === id) setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit text-center md:text-left">Inquiry Inbox</h1>
          <p className="text-muted-foreground text-center md:text-left">Manage messages and collaborations from your portfolio visitors.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 px-3 py-1">
              {messages.filter(m => !m.is_read).length} Unread
           </Badge>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((m) => (
            <Card 
              key={m.id} 
              className={`p-4 border-slate-200 cursor-pointer hover:shadow-md transition-all flex items-center justify-between gap-4 relative group ${!m.is_read ? 'border-l-4 border-l-primary bg-primary/[0.02]' : ''}`}
              onClick={() => handleRead(m)}
            >
               <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!m.is_read ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                    {!m.is_read ? <Mail className="w-5 h-5" /> : <MailOpen className="w-5 h-5" />}
                  </div>
                  
                  <div className="flex-1 min-w-0 grid md:grid-cols-3 gap-4 items-center">
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">{m.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{m.subject || "No Subject"}</p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{m.message}</p>
                    </div>
                    <div className="text-right flex items-center justify-end gap-2 text-slate-400 font-medium">
                       <Clock className="w-3 h-3" />
                       <span className="text-[10px] uppercase font-bold tracking-widest">
                          {new Date(m.created_at).toLocaleDateString()}
                       </span>
                    </div>
                  </div>
               </div>
               
               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(m.id); }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
           <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-slate-300" />
           </div>
           <h3 className="font-bold text-slate-900 text-lg">Inbox is quiet</h3>
           <p className="text-muted-foreground text-sm max-w-[250px] text-center mt-1">
             When visitors reach out via your contact form, their inquiries will appear here.
           </p>
        </div>
      )}

      {/* Message View Dialog */}
      {selectedMessage && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                 <Clock className="w-3 h-3" /> Received: {new Date(selectedMessage.created_at).toLocaleString()}
              </div>
              <DialogTitle className="text-2xl font-bold font-outfit">{selectedMessage.subject || "New Inquiry"}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-2">
                 <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                    <User className="w-3 h-3 text-slate-400" />
                 </div>
                 <span className="font-bold text-slate-900">{selectedMessage.name}</span>
                 <span className="text-slate-400">({selectedMessage.email})</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6 border-y border-slate-100 my-4">
               <p className="text-slate-700 leading-relaxed font-outfit whitespace-pre-wrap">
                  {selectedMessage.message}
               </p>
            </div>
            
            <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
              <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold" onClick={() => handleDelete(selectedMessage.id)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete Message
              </Button>
              <div className="flex gap-2">
                 <Button variant="outline" className="font-bold border-slate-200" onClick={() => setIsDialogOpen(false)}>
                   Close
                 </Button>
                 <Link href={`mailto:${selectedMessage.email}`}>
                    <Button className="font-bold gap-2 shadow-lg shadow-primary/20">
                      <Reply className="w-4 h-4" /> Reply via Email
                    </Button>
                 </Link>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
