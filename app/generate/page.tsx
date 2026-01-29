"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateBlogPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tone, setTone] = useState("Informative");
  const [length, setLength] = useState("medium");
  const [audience, setAudience] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!title || !description || loading) return;

    setLoading(true);
    setError("");

    try {
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

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      localStorage.setItem("generatedBlog", data.blog);
      router.push("/output");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6 text-white">
      <h1 className="text-3xl font-bold text-center">Generate Blog</h1>

      {/* FORM */}
      <div className="space-y-4 bg-black/50 p-6 rounded-xl">
        <input
          className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          placeholder="Blog title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          placeholder="Short description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="w-full p-3 rounded bg-gray-900 border border-gray-700"
          placeholder="Target audience"
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            className="p-3 rounded bg-gray-900 border border-gray-700"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          >
            <option>Informative</option>
            <option>Professional</option>
            <option>Casual</option>
            <option>Friendly</option>
          </select>

          <select
            className="p-3 rounded bg-gray-900 border border-gray-700"
            value={length}
            onChange={(e) => setLength(e.target.value)}
          >
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="long">Long</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 py-3 rounded font-semibold"
        >
          {loading ? "Generating..." : "Generate Blog"}
        </button>

        {error && <p className="text-red-500">{error}</p>}
      </div>
    </main>
  );
}