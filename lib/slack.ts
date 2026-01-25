export async function sendSlackApprovalMessage({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      channel: process.env.SLACK_CHANNEL_ID,
      text: "New blog draft ready",
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `📝 *${title}*\nSlug: \`${slug}\`\nStatus: Draft`,
          },
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "✅ Approve" },
              style: "primary",
              value: slug,
              action_id: "approve_blog",
            },
            {
              type: "button",
              text: { type: "plain_text", text: "❌ Decline" },
              style: "danger",
              value: slug,
              action_id: "decline_blog",
            },
          ],
        },
      ],
    }),
  });

  const data = await res.json();
  if (!data.ok) throw new Error(data.error);
}