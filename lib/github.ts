import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function commitToGitHub(
  path: string,
  content: string,
  message: string
) {
  const owner = process.env.GITHUB_OWNER!;
  const repo = process.env.GITHUB_REPO!;
  const branch = process.env.GITHUB_BRANCH!;

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
    // file does not exist
  }

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: encoded,
    branch,
    sha,
  });
}