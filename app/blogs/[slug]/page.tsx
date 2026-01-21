import fs from "fs";
import path from "path";

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = path.resolve(
    "./content/blogs/dev",
    `${slug}.mdx`
  );
  console.log("CWD:", process.cwd());
  console.log("FILE PATH:", filePath);

  if (!fs.existsSync(filePath)) {
    return <h1>Blog not found</h1>;
  }

  const content = fs.readFileSync(filePath, "utf-8");

  return (
    <main style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <article>
        <pre style={{ whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
          {content}
        </pre>
      </article>
    </main>
  );
}