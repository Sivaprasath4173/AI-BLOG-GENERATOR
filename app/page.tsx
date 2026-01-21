import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-700 via-pink-600 to-orange-500 text-white">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-6">
        <h1 className="text-2xl font-bold tracking-wide">
          ✨ AI Blog Generator
        </h1>

        <nav className="flex gap-6 text-sm font-medium">
          <Link href="/blogs" className="hover:underline">
            History
          </Link>
          <Link href="/generate" className="hover:underline">
            Generate
          </Link>
          <a href="#about" className="hover:underline">
            About
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <h2 className="text-5xl font-extrabold mb-6 leading-tight">
          Create Blogs with <br /> AI in Seconds 🚀
        </h2>

        <p className="max-w-2xl text-lg text-white/90 mb-10">
          Generate high‑quality, long‑form blog posts using AI. Choose your
          tone, length, and audience — let the AI do the writing for you.
        </p>

        <div className="flex gap-6">
          <Link
            href="/generate"
            className="px-8 py-4 rounded-xl bg-black/80 hover:bg-black text-white font-semibold transition"
          >
            Generate Blog
          </Link>

          <Link
            href="/blogs"
            className="px-8 py-4 rounded-xl bg-white text-black hover:bg-gray-200 font-semibold transition"
          >
            History
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="bg-black/30 backdrop-blur-md px-8 py-20"
      >
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10 text-center">
          <div>
            <h3 className="text-xl font-bold mb-3">🤖 AI Powered</h3>
            <p className="text-white/80">
              Uses modern AI models to generate high‑quality, human‑like blog
              content.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">🎨 Custom Styles</h3>
            <p className="text-white/80">
              Choose tone, length, and target audience for every blog post.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">📚 Blog Management</h3>
            <p className="text-white/80">
              View, read, and manage all generated blogs in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-white/70">
        © {new Date().getFullYear()} AI Blog Generator · Built with Next.js & AI
      </footer>
    </main>
  );
}
