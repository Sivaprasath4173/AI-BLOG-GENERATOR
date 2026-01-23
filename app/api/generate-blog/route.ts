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

    // 🔁 Retry once if Gemini returns empty content
    if (!blogBody.trim()) {
      const retryRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text:
                      prompt +
                      "\n\nIMPORTANT: You must return a complete blog article in plain text. Do not return empty output.",
                  },
                ],
              },
            ],
          }),
        }
      );

      const retryData = await retryRes.json();
      const retryCandidate = retryData?.candidates?.[0];

      if (retryCandidate?.content?.parts?.length) {
        blogBody = retryCandidate.content.parts
          .map((p: any) => p.text)
          .join("\n");
      }
    }

    if (!blogBody.trim()) {
      // 🛟 FINAL FALLBACK (prevents total failure during Gemini issues)
      blogBody = `
## Introduction
${description}

## Overview
This article explores **${title}** in a clear and practical way.

## Key Points
- Background and context
- Important concepts
- Real‑world relevance

## Why It Matters
Understanding ${title} helps readers make better decisions and stay informed.

## Conclusion
While the AI service was temporarily unavailable, this fallback content ensures the workflow continues without interruption.
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
      // 🔧 Auto-commit draft (expects server running on dev branch)
      const currentBranch = execSync("git branch --show-current", {
        encoding: "utf8",
      }).trim();

      if (currentBranch !== "dev") {
        console.warn(
          `Auto-commit skipped: current branch is "${currentBranch}", expected "dev"`
        );
      } else {
        execSync(`git add ${filePath}`, { stdio: "ignore" });
        execSync(`git commit -m "chore(dev): add draft blog ${slug}"`, {
          stdio: "ignore",
        });
        execSync("git push origin dev", { stdio: "ignore" });
      }
    } catch (gitError) {
      console.warn("Git auto-commit (dev) failed:", gitError);
    }

    return NextResponse.json({
      success: true,
      slug,
    });
  } catch (error) {
    console.error("Error generating blog:", error);
    return NextResponse.json(
      { error: "Failed to generate blog" },
      { status: 500 }
    );
  }
}