import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { sendSlackApproval } from "@/lib/slack";

export async function POST(req: Request) {
  const { title, description, tone, length, audience } = await req.json();

  if (!title || !description) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // ===== PROFESSIONAL LONG-FORM BLOG PROMPT =====
  const blog = `
# ${title}

## Introduction
${description}

This article is written by a professional blog writer AI. It is a long-form,
well-structured, and in-depth guide created specifically for **${audience}**.
The tone of this article is **${tone.toLowerCase()}**, focusing on clarity,
accuracy, and real-world relevance.

---

## Understanding ${title}

${title} is an important topic that requires clear conceptual understanding.
This section explains the background, purpose, and importance of the topic
in a structured and easy-to-follow manner.

---

## Key Concepts Explained

- Core definition and meaning
- Why ${title} matters today
- Who it impacts and how
- Important terminology and ideas

Each concept is explained step by step to avoid confusion.

---

## Practical Applications

In real-world scenarios, ${title} plays a significant role in planning,
execution, and decision-making. Understanding these applications helps
${audience} apply theoretical knowledge effectively.

---

## Best Practices

1. Follow official guidelines and trusted sources
2. Plan early and stay organized
3. Avoid assumptions and misinformation
4. Regularly check for updates

---

## Common Mistakes to Avoid

- Misinterpreting requirements
- Ignoring critical steps
- Relying on outdated information

---

## Conclusion

In conclusion, **${title}** is a critical topic for **${audience}**.
This professionally written guide provides a complete understanding and
equips readers with the confidence to make informed decisions.
`;

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // ===== SAVE TO DEV FOLDER ONLY =====
  const blogsDir = path.join(
    process.cwd(),
    "content",
    "blogs",
    "dev"
  );
  fs.mkdirSync(blogsDir, { recursive: true });

  const mdx = `---
title: "${title}"
audience: "${audience}"
tone: "${tone}"
length: "${length}"
---

${blog}
`;

  const filePath = path.join(blogsDir, `${slug}.mdx`);
  fs.writeFileSync(filePath, mdx, "utf-8");

  // ===== AUTO GIT COMMIT (SAFE) =====
  try {
    execSync(`git add "${filePath}"`, { cwd: process.cwd() });
    execSync(`git commit -m "feat(dev): add blog ${slug}"`, {
      cwd: process.cwd(),
    });
  } catch (e) {
    console.error("Auto-commit failed:", e);
  }

  // ===== SLACK NOTIFICATION (NON-BLOCKING & SAFE) =====
  try {
    await sendSlackApproval(title, slug);
  } catch (err) {
    console.error("Slack notification failed:", err);
  }

  return NextResponse.json({
    success: true,
    slug,
    blog,
  });
}
