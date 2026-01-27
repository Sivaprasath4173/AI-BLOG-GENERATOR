export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import slugify from "slugify";
import { execSync } from "child_process";

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

    const prompt = `
You are a professional technical blog writer.

TASK:
Write a LONG, ORIGINAL, and DETAILED blog article of AT LEAST 800 WORDS.

IMPORTANT ANTI-ECHO RULES (STRICT):
- Do NOT repeat the title or description verbatim.
- Do NOT paraphrase the description sentence-by-sentence.
- Use the description ONLY as context, not as content.
- Generate NEW explanations in your own words.

Context (for understanding only, do NOT copy):
Title: ${title}
Audience: ${audience || "General readers"}
Tone: ${tone}
Topic Context: ${description}

MANDATORY STRUCTURE:
## Introduction
Write 2–3 original paragraphs introducing the topic without copying the description.

## Background / Basics
Explain fundamentals from first principles.

## Detailed Explanation
Provide deep explanations with examples and analogies.

## Real-world Applications
Explain multiple real-life use cases in detail.

## Advantages and Limitations
Critically analyze strengths and weaknesses.

## Conclusion
Write 2–3 original paragraphs summarizing insights and future relevance.

STRICT RULES:
- Each section must contain multiple paragraphs
- Use markdown headings (##)
- Do NOT be brief
- Do NOT reuse user-provided sentences
- Output ONLY the blog content

Begin writing the article now.
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
    const candidate = aiData?.candidates?.[0];

    let blogBody = "";
    if (candidate?.content?.parts?.length) {
      blogBody = candidate.content.parts.map((p: any) => p.text).join("\n");
    }

    if (!blogBody.trim()) {
      blogBody = `
## Introduction
${description}

## Conclusion
This article explains ${title} in a clear and structured way.
`;
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

    const devDir = path.join(process.cwd(), "content/blogs/dev");
    await fs.promises.mkdir(devDir, { recursive: true });

    const filePath = path.join(devDir, `${slug}.mdx`);
    await fs.promises.writeFile(filePath, content, "utf8");

    try {
      const currentBranch = execSync("git branch --show-current", {
        encoding: "utf8",
      }).trim();

      if (currentBranch === "dev") {
        execSync(`git add ${filePath}`, { stdio: "ignore" });
        execSync(`git commit -m "chore(dev): add draft blog ${slug}"`, {
          stdio: "ignore",
        });
        execSync("git push origin dev", { stdio: "ignore" });
      }
    } catch {
      // ignore git errors on server
    }

    return NextResponse.json({ success: true, slug });
  } catch (error) {
    console.error("Error generating blog:", error);
    return NextResponse.json(
      { error: "Failed to generate blog" },
      { status: 500 }
    );
  }
}