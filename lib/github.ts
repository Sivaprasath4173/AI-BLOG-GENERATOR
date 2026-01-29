import { Octokit } from "@octokit/rest";

const IS_VERCEL = !!process.env.VERCEL;

const token = process.env.GITHUB_TOKEN;

const octokit = token
  ? new Octokit({ auth: token })
  : null;

export async function commitToGitHub(
  path: string,
  content: string,
  message: string
) {
  // ❌ Never run GitHub writes on Vercel
  if (IS_VERCEL) {
    console.log("⏭️ Skipping GitHub commit on Vercel");
    return;
  }

  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH;

  if (!octokit || !owner || !repo || !branch) {
    console.warn("⚠️ GitHub config missing, skipping commit");
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

    if (!Array.isArray(data)) sha = data.sha;
  } catch {}

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: encoded,
    branch,
    sha,
  });

  console.log(`✅ GitHub commit: ${path}`);
}