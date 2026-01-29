import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

const blogsDir = path.join(process.cwd(), "content/blogs");

export async function POST(req: Request) {
  try {
    const { title, description, audience } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const prompt = `
Write a safe, educational blog article.

Title: ${title}
Description: ${description}
Audience: ${audience}

Rules:
- Non-violent
- Non-political
- Non-sexual
- Helpful and educational
`;

    const result = await model.generateContent(prompt);
    const blog = result.response.text();

    if (!fs.existsSync(blogsDir)) {
      fs.mkdirSync(blogsDir, { recursive: true });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const mdxContent = `---
title: "${title}"
description: "${description}"
audience: "${audience}"
date: "${new Date().toISOString()}"
---

${blog}
`;

    fs.writeFileSync(path.join(blogsDir, `${slug}.mdx`), mdxContent);

    return NextResponse.json({ slug });
  } catch (err) {
    console.error("Generate API error:", err);
    return NextResponse.json(
      { error: "Failed to generate blog" },
      { status: 500 }
    );
  }
}