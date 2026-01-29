type BlogDetails = {
  title: string;
  author: string;
  summary: string;
  previewUrl: string;
};

export async function sendSlackApprovalMessage(blog: BlogDetails) {
  console.log("🚀 sendSlackApprovalMessage CALLED", blog);
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  // If Slack is not configured, silently skip (do NOT break blog generation)
  if (!webhookUrl) {
    console.warn("⚠️ SLACK_WEBHOOK_URL missing, skipping Slack notification");
    return;
  }

  // Validate webhook format to avoid fetch crash
  if (!webhookUrl.startsWith("https://hooks.slack.com/")) {
    console.error("❌ Invalid SLACK_WEBHOOK_URL format");
    return;
  }

  const baseUrl =
    blog.previewUrl && blog.previewUrl.trim().length > 0
      ? blog.previewUrl
      : "http://localhost:3000/api/blog/approval?id=unknown";

  const payload = {
    text: `New blog pending approval: ${blog.title}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📝 Blog Approval Request",
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Title:*\n${blog.title}`,
          },
          {
            type: "mrkdwn",
            text: `*Author:*\n${blog.author}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Summary:*\n${blog.summary}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "🔍 Preview Blog" },
            url: blog.previewUrl,
          },
          {
            type: "button",
            text: { type: "plain_text", text: "✅ Approve" },
            style: "primary",
            url: `${baseUrl}&action=approve`,
          },
          {
            type: "button",
            text: { type: "plain_text", text: "❌ Decline" },
            style: "danger",
            url: `${baseUrl}&action=decline`,
          },
        ],
      },
    ],
  };

  // Fire-and-forget Slack notification (never await)
  fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })
    .then((res) => res.text())
    .then((text) => {
      console.log("✅ Slack message sent");
    })
    .catch((err) => {
      console.error("❌ Slack send failed:", err);
    });
}

// Backward-compatible alias
export const sendSlackApproval = sendSlackApprovalMessage;