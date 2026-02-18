"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: string | null;
  author?: string | null;
  createdAt: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = () => {
    fetch("/api/blog?status=all")
      .then((r) => r.json())
      .then((d) => setPosts(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchPosts, []);

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this blog post?")) return;
    await fetch(`/api/blog/${slug}`, { method: "DELETE" });
    fetchPosts();
  };

  const toggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    await fetch(`/api/blog/${post.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchPosts();
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
          <Link
            href="/admin/blog/new"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
          >
            + New Post
          </Link>
        </div>

        {loading ? (
          <div className="text-slate-400">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No blog posts yet.</div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <div key={post.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-800/50 p-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white">{post.title}</div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    {post.author && <span>{post.author}</span>}
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleStatus(post)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    post.status === "PUBLISHED"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  }`}
                >
                  {post.status}
                </button>
                <Link href={`/admin/blog/${post.slug}`} className="text-xs text-sky-400 hover:text-sky-300">
                  Edit
                </Link>
                <button onClick={() => handleDelete(post.slug)} className="text-xs text-red-400 hover:text-red-300">
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
