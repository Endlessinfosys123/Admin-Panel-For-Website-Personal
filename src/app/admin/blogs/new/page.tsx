import { useState, useEffect, type ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Layout, 
  Type, 
  Globe, 
  Image as ImageIcon 
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button as UIButton } from "@/components/ui/button";
import { Input as UIInput } from "@/components/ui/input";
import { Card as UICard } from "@/components/ui/card";

const Button = UIButton as any;
const Input = UIInput as any;
const Card = UICard as any;

import { Editor } from "@/components/admin/Editor";
import { createClient } from "@/lib/supabase/client";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

export default function NewBlogPage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const supabase: SupabaseClient<Database> = createClient();

  useEffect(() => {
    if (editId) {
      fetchPost();
    }
  }, [editId]);

  const fetchPost = async () => {
    setFetching(true);
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("id", editId!)
      .single();

    if (error) {
      toast.error("Failed to fetch post");
      router.push("/admin/blogs");
    } else if (data) {
      const blog = data as any;
      setTitle(blog.title);
      setSlug(blog.slug);
      setExcerpt(blog.excerpt || "");
      setContent(blog.content);
      setImageUrl(blog.image_url || "");
    }
    setFetching(false);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editId) {
      // Auto-generate slug only on new posts
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generatedSlug);
    }
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!title || !slug || !content) {
      toast.error("Please fill in all required fields!");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      title,
      slug,
      excerpt: excerpt || content.substring(0, 150).replace(/<[^>]*>/g, ""),
      content,
      image_url: imageUrl,
      status,
      author_id: user?.id,
    };

    let error;
    if (editId) {
      const { error: updateError } = await (supabase.from("blogs") as any)
        .update(payload)
        .eq("id", editId);
      error = updateError;
    } else {
      const { error: insertError } = await (supabase.from("blogs") as any)
        .insert(payload);
      error = insertError;
    }

    if (error) {
      toast.error(`Error: ${error.message}`);
      setLoading(false);
      return;
    }

    toast.success(`Post ${status === 'published' ? 'published' : 'saved as draft'}!`);
    router.push("/admin/blogs");
    router.refresh();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/blogs">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Create New Post</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleSave('draft')}
            disabled={loading}
            className="font-bold border-slate-200"
          >
            Save Draft
          </Button>
          <Button 
            onClick={() => handleSave('published')}
            disabled={loading}
            className="font-bold gap-2 shadow-lg shadow-primary/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Publish Post
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-slate-200 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Type className="w-3 h-3" /> Post Title
                </label>
                <Input 
                  placeholder="The Future of AI..." 
                  className="text-2xl font-bold h-14 border-none shadow-none focus-visible:ring-0 bg-transparent px-0 placeholder:text-slate-200"
                  value={title}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => handleTitleChange(e.target.value)}
                />
              </div>
              <div className="w-full h-px bg-slate-100" />
              <div className="space-y-4">
                 <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Layout className="w-3 h-3" /> Content
                </label>
                <Editor content={content} onChange={setContent} />
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 shadow-sm space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Globe className="w-3 h-3" /> URL Slug
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-xs">/</span>
                  <Input 
                    placeholder="my-post-url" 
                    className="pl-6 h-10 bg-slate-50/50 border-slate-100 text-sm"
                    value={slug}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Featured Image URL
                </label>
                <Input 
                  placeholder="https://..." 
                  className="h-10 bg-slate-50/50 border-slate-100 text-sm"
                  value={imageUrl}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setImageUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Type className="w-3 h-3" /> Excerpt (Optional)
                </label>
                <textarea 
                  className="w-full min-h-[120px] rounded-xl bg-slate-50/50 border border-slate-100 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-outfit text-slate-600"
                  placeholder="A short summary of the post..."
                  value={excerpt}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setExcerpt(e.target.value)}
                />
              </div>
            </div>
          </Card>

          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <h3 className="font-bold text-primary mb-2">Publishing Tips</h3>
            <ul className="text-xs text-slate-600 space-y-2 list-disc ml-4">
              <li>Use a clear, keyword-rich slug for better SEO.</li>
              <li>Add a featured image to make your post stand out.</li>
              <li>The excerpt appears on the blog listing page.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
