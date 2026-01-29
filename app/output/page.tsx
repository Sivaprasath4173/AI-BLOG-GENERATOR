"use client";

import { useEffect, useState } from "react";

export default function OutputPage() {
  const [blog, setBlog] = useState("");

  useEffect(() => {
    const storedBlog = localStorage.getItem("generatedBlog");
    if (storedBlog) {
      setBlog(storedBlog);
    }
  }, []);

  if (!blog) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        <p>No blog generated yet.</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">
        AI Generated Blog
      </h1>

      <article className="whitespace-pre-wrap bg-black/50 p-6 rounded-xl">
        {blog}
      </article>
    </main>
  );
}
