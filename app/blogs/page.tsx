import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-4xl text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-accent mb-6">
          AI Blog Generator
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 mb-10">
          Create high-quality blogs using AI.
          Preview, approve, and publish content in seconds — no writing required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
          <Link
            href="/generate"
            className="px-8 py-4 rounded-xl bg-accent text-black font-semibold hover:opacity-90 transition"
          >
            ✨ Generate Blog
          </Link>

          <Link
            href="/blogs"
            className="px-8 py-4 rounded-xl border border-white/20 text-white hover:border-accent transition"
          >
            📚 View Blogs
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 text-left">
          <div className="p-6 rounded-xl bg-card border border-white/10">
            <h3 className="text-lg font-semibold text-accent2 mb-2">
              🤖 AI Powered
            </h3>
            <p className="text-gray-400 text-sm">
              Generate complete blog posts using advanced AI models in seconds.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-white/10">
            <h3 className="text-lg font-semibold text-accent2 mb-2">
              👀 Preview & Approve
            </h3>
            <p className="text-gray-400 text-sm">
              Review AI-generated content before publishing it live.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-white/10">
            <h3 className="text-lg font-semibold text-accent2 mb-2">
              🚀 Publish Instantly
            </h3>
            <p className="text-gray-400 text-sm">
              Save blogs as MDX files and publish instantly on your site.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}