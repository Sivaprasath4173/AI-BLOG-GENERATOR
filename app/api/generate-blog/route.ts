export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import slugify from "slugify";

export async function POST(req: Request) {
  try {
    const { title, description, audience = "General readers" } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const slug = slugify(title, { lower: true, strict: true });
    const prompt = `
You are a professional technical blog writer.

Write a LONG, ORIGINAL blog article of AT LEAST 800 WORDS.
Do NOT repeat or paraphrase the user description.
Use it only as context.

Title: ${title}
Audience: ${audience}

STRUCTURE:
## Introduction
## Background / Basics
## Detailed Explanation
## Real-world Applications
## Advantages and Limitations
## Conclusion

Rules:
- Multiple paragraphs per section
- Use markdown headings
- Output ONLY the blog content
`;

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const aiData = await aiRes.json();
    const parts = aiData?.candidates?.[0]?.content?.parts || [];
    const blogBody = parts.map((p: any) => p.text).join("\n").trim();

    if (!blogBody) {
      return NextResponse.json(
        { error: "AI returned empty content" },
        { status: 500 }
      );
    }

    const content = `---
title: "${title}"
description: "${description}"
audience: "${audience}"
---

${blogBody}
`;

    const outDir = path.join(process.cwd(), "content/blogs/dev");
    await fs.promises.mkdir(outDir, { recursive: true });
    await fs.promises.writeFile(path.join(outDir, `${slug}.mdx`), content, "utf8");

    return NextResponse.json({ success: true, slug });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate blog" }, { status: 500 });
  }
}