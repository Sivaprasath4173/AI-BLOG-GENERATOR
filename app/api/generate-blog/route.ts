import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      writingStyle,
      tone,
      length,
      audience
    } = body;

    const prompt = `
You are a professional blog writer.

Write a ${length} blog post.

Title: ${title}
Description: ${description}
Target Audience: ${audience}
Writing Style: ${writingStyle}
Tone: ${tone}

Structure:
- Introduction
- 3–4 sections with H2 headings
- Conclusion

Rules:
- Clear paragraphs
- No emojis
- Plain markdown only
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const content =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return Response.json(
        { success: false, raw: data },
        { status: 500 }
      );
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const filePath = path.join(
      process.cwd(),
      "content",
      "blogs",
      "dev",
      `${slug}.mdx`
    );

    const mdxContent = `---
title: "${title}"
description: "${description}"
date: "${new Date().toISOString()}"
---

${content}
`;

    fs.writeFileSync(filePath, mdxContent);

    // ---- AUTO GIT COMMIT & PUSH ----
    try {
      execSync("git add content/blogs/dev", { stdio: "ignore" });
      execSync(`git commit -m "Add blog: ${slug}"`, { stdio: "ignore" });
      execSync("git push origin main", { stdio: "ignore" });
    } catch (gitError) {
      console.error("Git automation failed:", gitError);
      // Do not fail the request if git push fails
    }
    // ---- END AUTO GIT ----

    return Response.json({
      success: true,
      slug
    });

  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, error: "Something went wrong" },
      { status: 500 }
    );
  }
}