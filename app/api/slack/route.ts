import { NextResponse } from "next/server";
import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const runtime = "nodejs";

// 🔐 Verify Slack signature
function verifySlackRequest(req: Request, rawBody: string) {
  const slackSignature = req.headers.get("x-slack-signature") || "";
  const slackTimestamp = req.headers.get("x-slack-request-timestamp") || "";

  const sigBaseString = `v0:${slackTimestamp}:${rawBody}`;
  const mySignature =
    "v0=" +
    crypto
      .createHmac("sha256", process.env.SLACK_SIGNING_SECRET!)
      .update(sigBaseString)
      .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(slackSignature)
  );
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  // ❌ Reject invalid Slack requests
  if (!verifySlackRequest(req, rawBody)) {
    return NextResponse.json({ error: "Invalid Slack signature" }, { status: 401 });
  }

  // ✅ Slack sends form-encoded payload
  const params = new URLSearchParams(rawBody);
  const payload = JSON.parse(params.get("payload") || "{}");

  // ✅ Respond immediately (prevents Slack warning)
  const response = NextResponse.json({
    text: "⏳ Action received. Processing...",
    replace_original: false,
  });

  // 🔥 Handle approve / decline async
  (async () => {
    try {
      const action = payload.actions?.[0]?.value;
      const slug = payload.actions?.[0]?.block_id;

      if (action === "approve") {
        const root = process.cwd();

        const devPath = path.join(
          root,
          "content",
          "blogs",
          "dev",
          `${slug}.mdx`
        );

        const prodPath = path.join(
          root,
          "content",
          "blogs",
          "prod",
          `${slug}.mdx`
        );

        try {
          await fs.mkdir(path.dirname(prodPath), { recursive: true });
          await fs.rename(devPath, prodPath);
          console.log("✅ Blog published to prod:", slug);
          await execAsync(`git add ${prodPath}`);
          await execAsync(`git commit -m "chore(blog): publish ${slug}"`);
          await execAsync(`git push origin main`);
          console.log("🚀 Changes pushed to GitHub (main)");
          console.log("📦 GitHub commit created for publish:", slug);
        } catch (err) {
          console.error("❌ Failed to publish blog:", err);
        }
      }

      if (action === "decline") {
        const filePath = path.join(
          process.cwd(),
          "content",
          "blogs",
          "dev",
          `${slug}.mdx`
        );

        try {
          await fs.unlink(filePath);
          console.log("🗑 Blog deleted (declined):", slug);
          await execAsync(`git add ${filePath}`);
          await execAsync(`git commit -m "chore(blog): decline ${slug}"`);
          await execAsync(`git push origin main`);
          console.log("🚀 Decline commit pushed to GitHub (main)");
          console.log("📦 GitHub commit created for decline:", slug);
        } catch (err) {
          console.error("❌ Failed to delete declined blog:", err);
        }
      }
    } catch (err) {
      console.error("Slack action error:", err);
    }
  })();

  return response;
}