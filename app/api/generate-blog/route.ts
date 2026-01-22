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

    const slug = slugify(title, { lower: true, strict: true, trim: true });

    const wordRules =
      length === "short"
        ? "Write at least 250 words."
        : length === "long"
        ? "Write at least 1000 words."
        : "Write at least 600 words.";

    const prompt = `
You are an expert blog writer.

Title: ${title}
Audience: ${audience || "General readers"}
Tone: ${tone}

Rules:
- ${wordRules}
- Use clear section headings
- Start with an introduction
- End with a conclusion
- Do not be brief

Blog:
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
    console.log("Gemini HTTP status:", aiRes.status);

    const aiData = await aiRes.json();
    console.log("Gemini raw response:", JSON.stringify(aiData, null, 2));

    const candidate = aiData?.candidates?.[0];
    let blogBody = "";

    if (candidate?.content?.parts?.length) {
      blogBody = candidate.content.parts
        .map((p: any) => p.text)
        .join("\n");
    }

    if (!blogBody.trim()) {
      throw new Error("Gemini returned empty content");
    }

    const content = `---
title: "${title}"
description: "${description}"
audience: "${audience}"
tone: "${tone}"
length: "${length}"
---

${blogBody}
`;

    // ✅ WRITE LOCALLY (required for /blogs/[slug])
    const localDir = path.join(process.cwd(), "content", "blogs", "dev");
    fs.mkdirSync(localDir, { recursive: true });
    fs.writeFileSync(path.join(localDir, `${slug}.mdx`), content, "utf8");

    // ✅ IMPORTANT: ALWAYS RETURN A RESPONSE
    return NextResponse.json({ success: true, slug });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}