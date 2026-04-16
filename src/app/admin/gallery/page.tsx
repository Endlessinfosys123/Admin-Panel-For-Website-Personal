"use client";

import { useState, useEffect, useCallback, type ChangeEvent } from "react";
import { 
  Plus, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button as UIButton } from "@/components/ui/button";

const Button = UIButton as any;
import { PhotoGrid } from "@/components/admin/Gallery/PhotoGrid";
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

const Input = UIInput as any;

interface Photo {
  id: string;
  url: string;
  caption?: string | null;
}

export default function GalleryPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const supabase = createClient();

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      toast.error("Failed to load gallery");
    } else {
      setPhotos(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `gallery/${fileName}`;

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);

      // 3. Save to Database
      const { error: dbError } = await (supabase.from("gallery") as any).insert({
        url: publicUrl,
        caption: newCaption,
        display_order: photos.length,
      });

      if (dbError) throw dbError;

      toast.success("Image uploaded successfully!");
      setIsDialogOpen(false);
      setNewCaption("");
      setSelectedFile(null);
      fetchPhotos();
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const [reordering, setReordering] = useState(false);

  const handleDelete = async (id: string) => {
    const photoToDelete = photos.find(p => p.id === id);
    if (!photoToDelete) return;

    const isConfirmed = window.confirm("Are you sure you want to delete this photo?");
    if (!isConfirmed) return;

    try {
      // 1. Delete from Storage (extract file path from URL)
      const urlParts = photoToDelete.url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `gallery/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from("gallery")
        .remove([filePath]);

      // 2. Delete from Database
      const { error: dbError } = await (supabase.from("gallery") as any).delete().eq("id", id);
      
      if (dbError) throw dbError;

      setPhotos(photos.filter((p) => p.id !== id));
      toast.success("Image removed successfully");
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const handleReorder = async (newPhotos: Photo[]) => {
    setPhotos(newPhotos);
    setReordering(true);
    
    // Update order in background
    const updates = newPhotos.map((photo, index) => ({
      id: photo.id,
      display_order: index,
    }));

    try {
      // Direct update loop (Supabase doesn't have true batch update for order yet without RPC)
      // but we can at least wait for them to finish
      await Promise.all(
        updates.map(update => 
          (supabase.from("gallery") as any)
            .update({ display_order: update.display_order })
            .eq("id", update.id)
        )
      );
    } catch (error) {
      console.error("Reorder failed", error);
      toast.error("Failed to save new order");
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit text-center md:text-left">Brand Gallery</h1>
          <p className="text-muted-foreground text-center md:text-left">Curate your professional photo collection and visual assets.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold gap-2 shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" /> Upload Image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload New Photo</DialogTitle>
              <DialogDescription>
                Add a high-quality professional image to your brand gallery.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Select Image</label>
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:bg-slate-50 transition-colors cursor-pointer relative group">
                   <input 
                     type="file" 
                     className="absolute inset-0 opacity-0 cursor-pointer" 
                     accept="image/*"
                     onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                   />
                   <Upload className="w-8 h-8 text-slate-300 mb-2 group-hover:text-primary transition-colors" />
                   <span className="text-sm font-semibold text-slate-500">
                     {selectedFile ? selectedFile.name : "Click or drag to upload"}
                   </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Caption (Optional)</label>
                <Input 
                  placeholder="Founder at AI Conference 2026" 
                  value={newCaption}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCaption(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleUpload} 
                disabled={uploading || !selectedFile}
                className="w-full font-bold gap-2"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? "Uploading..." : "Start Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {reordering && (
         <div className="fixed inset-0 bg-black/5 flex items-center justify-center z-50 animate-in fade-in">
           <div className="bg-white p-4 rounded-2xl shadow-xl shadow-slate-200/50 flex items-center gap-3">
             <Loader2 className="w-5 h-5 animate-spin text-primary" />
             <span className="text-sm font-bold text-slate-900">Saving new order...</span>
           </div>
         </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      ) : photos.length > 0 ? (
        <PhotoGrid 
          photos={photos} 
          onDelete={handleDelete} 
          onReorder={handleReorder} 
        />
      ) : (
        <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30">
           <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-slate-300" />
           </div>
           <h3 className="font-bold text-slate-900 text-lg">Your gallery is empty</h3>
           <p className="text-muted-foreground text-sm max-w-[250px] text-center mt-1">
             Start uploading your professional headshots and event photos now.
           </p>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 text-amber-800">
         <AlertCircle className="w-5 h-5 shrink-0" />
         <div className="text-xs space-y-1">
           <p className="font-bold">Pro Tip: Drag & Drop Ordering</p>
           <p className="font-medium opacity-80">You can drag the handle icon on any image to reorder how they appear on the main website.</p>
         </div>
      </div>
    </div>
  );
}
