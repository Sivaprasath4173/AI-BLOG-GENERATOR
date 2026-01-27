import { NextRequest } from "next/server";
import { sendSlackApprovalMessage } from "@/lib/slack";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const action = searchParams.get("action"); // approve | decline
  const blogId = searchParams.get("id");     // blog identifier

  if (!action || !blogId) {
    return Response.json(
      { error: "Missing action or blogId" },
      { status: 400 }
    );
  }

  if (action === "approve") {
    // ✅ TODO: push blog to GitHub here
    console.log(`Blog ${blogId} approved`);

    return Response.json({
      status: "approved",
      blogId,
    });
  }

  if (action === "decline") {
    console.log(`Blog ${blogId} declined`);

    return Response.json({
      status: "declined",
      blogId,
    });
  }

  return Response.json(
    { error: "Invalid action" },
    { status: 400 }
  );
}