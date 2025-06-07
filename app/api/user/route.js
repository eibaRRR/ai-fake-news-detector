import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import clientPromise from "@/lib/mongodb";

export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db();
    
    const deleteResult = await db.collection("users").deleteOne({ email: session.user.email });

    if (deleteResult.deletedCount === 0) {
        return NextResponse.json({ error: "User not found or already deleted." }, { status: 404 });
    }

    return NextResponse.json({ message: "Account deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete user account:", error);
    return NextResponse.json({ error: "Failed to delete account." }, { status: 500 });
  }
}