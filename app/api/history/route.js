import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

// GET /api/history - Fetches history for the logged-in user
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    const user = await db.collection("users").findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.history || []);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

// DELETE /api/history - Clears history for the logged-in user
export async function DELETE() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        await db.collection("users").updateOne(
            { email: session.user.email },
            { $set: { history: [] } }
        );

        return NextResponse.json({ message: "History cleared" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to clear history" }, { status: 500 });
    }
}