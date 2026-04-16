"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button as UIButton } from "@/components/ui/button";
import { Input as UIInput } from "@/components/ui/input";
import { Badge as UIBadge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card as UICard } from "@/components/ui/card";

const Button = UIButton as any;
const Input = UIInput as any;
const Badge = UIBadge as any;
const Card = UICard as any;

interface Blog {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
}

interface BlogListProps {
  initialBlogs: Blog[];
}

export function BlogList({ initialBlogs }: BlogListProps) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this post?");
    if (!isConfirmed) return;

    const { error } = await (supabase.from("blogs") as any).delete().eq("id", id);
    if (error) {
      toast.error(`Delete failed: ${error.message}`);
    } else {
      setBlogs(blogs.filter((b) => b.id !== id));
      toast.success("Post deleted successfully");
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(search.toLowerCase()) || 
                          blog.slug.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || blog.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search posts..." 
              className="pl-9 h-9 border-slate-200 bg-slate-50/50" 
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
             <Badge 
                variant={filter === 'all' ? 'default' : 'outline'} 
                className={`px-3 py-1 cursor-pointer hover:bg-slate-50 ${filter === 'all' ? 'bg-primary text-white' : 'bg-white text-slate-400'}`}
                onClick={() => setFilter('all')}
             >
                All
             </Badge>
             <Badge 
                variant={filter === 'published' ? 'default' : 'outline'} 
                className={`px-3 py-1 cursor-pointer hover:bg-slate-50 ${filter === 'published' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'}`}
                onClick={() => setFilter('published')}
             >
                Published
             </Badge>
             <Badge 
                variant={filter === 'draft' ? 'default' : 'outline'} 
                className={`px-3 py-1 cursor-pointer hover:bg-slate-50 ${filter === 'draft' ? 'bg-amber-500 text-white' : 'bg-white text-slate-400'}`}
                onClick={() => setFilter('draft')}
             >
                Drafts
             </Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="w-[400px]">Post Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBlogs.length > 0 ? (
                filteredBlogs.map((blog) => (
                  <TableRow key={blog.id} className="group hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 truncate">{blog.title}</span>
                          <span className="text-xs text-muted-foreground truncate italic">/{blog.slug}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={blog.status === 'published' ? 'default' : 'secondary'}
                        className={blog.status === 'published' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-100 text-slate-600'}
                      >
                        {blog.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500 font-medium">
                      {new Date(blog.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <Link href={`/admin/blogs/new?id=${blog.id}`}>
                            <DropdownMenuItem className="gap-2 focus:bg-slate-50 cursor-pointer">
                              <Edit2 className="w-3.5 h-3.5" /> Edit Post
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem className="gap-2 focus:bg-slate-50 cursor-pointer">
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="gap-2 text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                            onClick={() => handleDelete(blog.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic">
                    No blog posts found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
