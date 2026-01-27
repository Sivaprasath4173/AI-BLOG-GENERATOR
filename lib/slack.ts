type BlogDetails = {
  title: string;
  author: string;
  summary: string;
  previewUrl: string;
};

export async function sendSlackApprovalMessage(blog: BlogDetails) {
  console.log("🚀 sendSlackApprovalMessage CALLED", blog);
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("Slack webhook URL missing");
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
            text: {
              type: "plain_text",
              text: "✅ Approve",
            },
            style: "primary",
            url: `${baseUrl}&action=approve`,
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "❌ Decline",
            },
            style: "danger",
            url: `${baseUrl}&action=decline`,
          },
        ],
      },
    ],
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await res.text();
  console.log("Slack response:", result);
}