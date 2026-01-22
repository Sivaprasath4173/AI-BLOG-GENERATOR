export async function notifySlack(message: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  console.log("🔔 Slack webhook:", webhookUrl ? "FOUND" : "MISSING");

  if (!webhookUrl) {
    console.warn("⚠️ SLACK_WEBHOOK_URL not set");
    return;
  }

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: message }),
  });

  console.log("🔔 Slack response status:", res.status);
}