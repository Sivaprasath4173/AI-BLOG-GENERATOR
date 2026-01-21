"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GenerateBlogPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("Informative");
  const [length, setLength] = useState("medium");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);

  const canGenerate = title.trim() && description.trim();

  async function handleGenerate() {
    if (!canGenerate || loading) return;

    setLoading(true);

    const res = await fetch("/api/generate-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        tone,
        length,
        audience,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.slug) {
      router.push(`/blogs/${data.slug}`);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900 text-white px-6 py-16">
      <div className="max-w-2xl mx-auto space-y-6 bg-black/60 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
        <h1 className="text-3xl font-bold text-center">
          ✨ Generate Blog
        </h1>

        <input
          type="text"
          placeholder="Blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700"
        />

        <textarea
          placeholder="Short description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700"
        />

        <input
          type="text"
          placeholder="Target audience (optional)"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700"
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="px-4 py-3 rounded-lg bg-gray-900 border border-gray-700"
          >
            <option>Informative</option>
            <option>Professional</option>
            <option>Casual</option>
            <option>Friendly</option>
          </select>

          <select
            value={length}
            onChange={(e) => setLength(e.target.value)}
            className="px-4 py-3 rounded-lg bg-gray-900 border border-gray-700"
          >
            <option value="short">Short (250+ words)</option>
            <option value="medium">Medium (600+ words)</option>
            <option value="long">Long (1000+ words)</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!canGenerate || loading}
          className={`w-full py-3 rounded-xl font-semibold transition ${
            canGenerate
              ? "bg-purple-600 hover:bg-purple-700"
              : "bg-gray-700 cursor-not-allowed"
          }`}
        >
          {loading ? "Generating..." : "Generate Blog"}
        </button>

        <div className="text-center pt-4">
          <Link href="/blogs" className="text-purple-400 hover:underline">
            View Blogs →
          </Link>
        </div>
      </div>
    </main>
  );
}