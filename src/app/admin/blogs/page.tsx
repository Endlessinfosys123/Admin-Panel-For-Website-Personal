import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { BlogList } from "@/components/admin/Blogs/BlogList";

export default async function BlogsPage() {
  const supabase: SupabaseClient<Database> = createClient();
  const { data, error } = await supabase
    .from("blogs")
    .select("id, title, slug, status, created_at")
    .order("created_at", { ascending: false });

  const blogs = data as any[] | null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your articles, stories, and technical insights.</p>
        </div>
        <Link href="/admin/blogs/new">
          <Button className="font-bold gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> New Post
          </Button>
        </Link>
      </div>

      <BlogList initialBlogs={blogs || []} />
    </div>
  );
}
