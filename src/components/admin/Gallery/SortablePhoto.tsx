"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, GripVertical } from "lucide-react";
import { Button as UIButton } from "@/components/ui/button";

const Button = UIButton as any;

interface SortablePhotoProps {
  id: string;
  url: string;
  caption?: string;
  onDelete: (id: string) => void;
}

export function SortablePhoto({ id, url, caption, onDelete }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all"
    >
      <div className="aspect-square relative flex items-center justify-center bg-slate-100">
        <img
          src={url}
          alt={caption || "Gallery image"}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/20 hover:bg-white/40 text-white border border-white/20"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {caption && (
        <div className="p-3">
          <p className="text-xs font-semibold text-slate-600 truncate">{caption}</p>
        </div>
      )}
    </div>
  );
}
