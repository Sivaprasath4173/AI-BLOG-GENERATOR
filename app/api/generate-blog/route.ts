import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const { title, description, tone, length, audience } = await req.json();

  if (!title || !description) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const blog = `
# ${title}

${description}

## Details
- Audience: ${audience}
- Tone: ${tone}
- Length: ${length}

## Conclusion
This blog was generated successfully.
`;

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const blogsDir = path.join(process.cwd(), "content/blogs");
  if (!fs.existsSync(blogsDir)) {
    fs.mkdirSync(blogsDir, { recursive: true });
  }

  const mdx = `---
title: "${title}"
audience: "${audience}"
tone: "${tone}"
length: "${length}"
---

${blog}
`;

  fs.writeFileSync(path.join(blogsDir, `${slug}.mdx`), mdx, "utf-8");

  return NextResponse.json({ blog, slug });
}
