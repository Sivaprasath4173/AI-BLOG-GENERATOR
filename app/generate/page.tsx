import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const { title, description, writingStyle, tone, length, audience, previewOnly } = await req.json();

    if (!title || title.trim() === "") {
      return Response.json(
        { success: false, error: "Title is required" },
        { status: 400 }
      );
    }

    // Your existing POST handler logic here...

    return Response.json({ success: true, slug: "example-slug", content: "Generated content..." });
  } catch (err) {
    return Response.json(
      { success: false, error: "Generation failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { slug } = await req.json();

    if (!slug) {
      return Response.json(
        { success: false, error: "Slug required" },
        { status: 400 }
      );
    }

    const filePath = path.join(
      process.cwd(),
      "content/blogs/dev",
      `${slug}.mdx`
    );

    if (!fs.existsSync(filePath)) {
      return Response.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    fs.unlinkSync(filePath);

    return Response.json({ success: true });
  } catch (err) {
    return Response.json(
      { success: false, error: "Delete failed" },
      { status: 500 }
    );
  }
}