export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import slugify from "slugify";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      title,
      description,
      audience = "",
      tone = "Informative",
      length = "medium",
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const slug = slugify(title, {
      lower: true,
      strict: true,
      trim: true,
    });

    const blogsDir = path.join(process.cwd(), "content", "blogs", "dev");
    fs.mkdirSync(blogsDir, { recursive: true });

    const filePath = path.join(blogsDir, `${slug}.mdx`);

    const wordRules =
      length === "short"
        ? "Write at least 250 words."
        : length === "long"
        ? "Write at least 1000 words."
        : "Write at least 600 words.";

    const prompt = `
You are a professional blog writer.

Title: ${title}
Audience: ${audience}
Tone: ${tone}

Instructions:
- ${wordRules}
- Use clear section headings
- Add an introduction and a conclusion
- Explain concepts clearly
- Do NOT be brief

Blog:
`;

    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const aiData = await aiResponse.json();
    const blogBody =
      aiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "AI failed to generate content.";

    const content = `---
title: "${title}"
description: "${description}"
audience: "${audience}"
tone: "${tone}"
length: "${length}"
---

${blogBody}
`;

    fs.writeFileSync(filePath, content, "utf8");

    return NextResponse.json({ success: true, slug });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}