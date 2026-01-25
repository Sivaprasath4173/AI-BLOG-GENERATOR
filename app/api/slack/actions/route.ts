import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const formData = await req.formData();
  const payload = JSON.parse(formData.get("payload") as string);

  const action = payload.actions[0];
  const slug = action.value;

  if (action.action_id === "approve_blog") {
    console.log("✅ APPROVED:", slug);
    // TODO: move blog dev → main + commit
    const devPath = path.join(process.cwd(), "content/blogs/dev", `${slug}.mdx`);
    const prodDir = path.join(process.cwd(), "content/blogs/prod");
    const prodPath = path.join(prodDir, `${slug}.mdx`);

    if (!fs.existsSync(devPath)) {
      throw new Error("Draft not found in dev");
    }

    fs.mkdirSync(prodDir, { recursive: true });
    fs.renameSync(devPath, prodPath);

    execSync("git checkout main", { stdio: "ignore" });
    execSync(`git add ${prodPath}`, { stdio: "ignore" });
    execSync(`git commit -m "chore(blog): publish ${slug}"`, { stdio: "ignore" });
    execSync("git push origin main", { stdio: "ignore" });
    execSync("git checkout dev", { stdio: "ignore" });
  }

  if (action.action_id === "decline_blog") {
    console.log("❌ DECLINED:", slug);
    // TODO: delete draft blog
    const devPath = path.join(process.cwd(), "content/blogs/dev", `${slug}.mdx`);

    if (fs.existsSync(devPath)) {
      fs.unlinkSync(devPath);
    }

    execSync(`git add content/blogs/dev`, { stdio: "ignore" });
    execSync(`git commit -m "chore(blog): decline ${slug}"`, { stdio: "ignore" });
    execSync("git push origin dev", { stdio: "ignore" });
  }

  return NextResponse.json({
    response_type: "ephemeral",
    text:
      action.action_id === "approve_blog"
        ? `✅ Blog *${slug}* approved and published`
        : `❌ Blog *${slug}* declined`,
  });
}