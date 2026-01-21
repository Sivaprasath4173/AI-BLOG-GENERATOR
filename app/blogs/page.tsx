import fs from "fs";
import path from "path";
import Link from "next/link";

export default function BlogsPage() {
  const blogsDir = path.join(process.cwd(), "content", "blogs", "dev");

  const blogs = fs.existsSync(blogsDir)
    ? fs
        .readdirSync(blogsDir)
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => file.replace(".mdx", ""))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-6 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-10 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          📚 Blog History
        </h1>

        {blogs.length === 0 && (
          <p className="text-gray-400 text-lg">
            No blogs found. Generate your first blog ✨
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {blogs.map((slug) => (
            <Link
              key={slug}
              href={`/blogs/${slug}`}
              className="group rounded-xl border border-white/10 bg-gradient-to-br from-gray-900 to-gray-800 p-6 shadow-lg hover:shadow-purple-500/20 transition-all hover:-translate-y-1"
            >
              <h2 className="text-2xl font-semibold capitalize text-white group-hover:text-purple-400 transition">
                {slug.replace(/-/g, " ")}
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Click to read full article →
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/generate"
            className="inline-block rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white hover:opacity-90 transition"
          >
            ✨ Generate New Blog
          </Link>
        </div>
      </div>
    </div>
  );
}