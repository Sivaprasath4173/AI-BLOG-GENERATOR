const IS_VERCEL = !!process.env.VERCEL;
import { Octokit } from "@octokit/rest";

const token = process.env.GITHUB_TOKEN;

// Create octokit only if token exists
const octokit = token
  ? new Octokit({ auth: token })
  : null;

export async function commitToGitHub(
  path: string,
  content: string,
  message: string
) {
  // ❌ Never run GitHub write operations on Vercel
  if (IS_VERCEL) {
    console.log("⏭️ Skipping GitHub commit on Vercel environment");
    return;
  }

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH;

  // ===== SAFETY CHECKS (DO NOT BREAK APP) =====
  if (!octokit) {
    console.warn("⚠️ GITHUB_TOKEN missing, skipping GitHub commit");
    return;
  }

  if (!owner || !repo || !branch) {
    console.warn(
      "⚠️ GitHub config missing (OWNER / REPO / BRANCH), skipping commit"
    );
    return;
  }

  const encoded = Buffer.from(content).toString("base64");
  let sha: string | undefined;

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if (!Array.isArray(data)) {
      sha = data.sha;
    }
  } catch {
    // File does not exist yet – this is OK
  }

  try {
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: encoded,
      branch,
      sha,
    });

    console.log(`✅ GitHub commit successful: ${path}`);
  } catch (err) {
    console.error("❌ GitHub commit failed:", err);
  }
}