import "./globals.css";

export const metadata = {
  title: "AutoBlog AI",
  description: "AI powered blog generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-bg text-gray-200 min-h-screen w-full">
        <header className="border-b border-white/10">
          <div className="w-full px-8 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-accent">
              AutoBlog AI
            </h1>

            <nav className="space-x-6 text-sm text-gray-400">
              <a href="/" className="hover:text-accent2">
                Home
              </a>
              <a href="/blogs" className="hover:text-accent2">
                Blogs
              </a>
            </nav>
          </div>
        </header>

        <main className="w-full py-10 pt-0 px-0">
          {children}
        </main>
      </body>
    </html>
  );
}